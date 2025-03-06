const fs = require('fs');
const { DOMParser } = require('xmldom');



function traverseDom(node, enterCallback, leaveCallback) {
    if (node) {
        // Invoke the enter callback upon entering the node
        enterCallback(node);

        // Recursively traverse child nodes
        for (let child = node.firstChild; child; child = child.nextSibling) {
            traverseDom(child, enterCallback, leaveCallback);
        }

        // Invoke the leave callback upon leaving the node
        leaveCallback(node);
    }
}



const NODE_TYPE_ELEMENT = 1;
const NODE_TYPE_TEXT = 3;

const node_renderer_enter = {
    _std: function (nodeRef) {
        if (nodeRef.nodeType === NODE_TYPE_TEXT) {
            return nodeRef.textContent;
        };
        if (nodeRef.nodeType === NODE_TYPE_ELEMENT) {
            let tmpstr = '';
            tmpstr += '\\' + nodeRef.tagName.replace('_STAR', '*');
            // Add params
            if (nodeRef.getAttribute('params')) {
                tmpstr += nodeRef.getAttribute('params');
            };
            // Add content
            if (nodeRef.childNodes.length > 0) {
                tmpstr += '{';
            };
            return tmpstr;
        };
    },
    xml2tex: function (nodeRef) {
        return '';
    },
    preamble: function (nodeRef) {
        return '';
    },
    document: function (nodeRef) {
        return '\\begin{document}';
    },
    beginend: function (nodeRef) {
        let tmpstr = '\\begin{' + nodeRef.getAttribute('env') + '}';
        // Add params
        if (nodeRef.getAttribute('params')) {
            tmpstr += nodeRef.getAttribute('params');
        };
        return tmpstr;
    },
    rawlatex: function (nodeRef) {
        // console.error(nodeRef.textContent);
        return '';
    },
}
const node_renderer_leave = {
    _std: function (nodeRef) {
        if (nodeRef.nodeType === NODE_TYPE_ELEMENT) {
            if (nodeRef.childNodes.length > 0) {
                return '}';
            };
        }
        return '';
    },
    xml2tex: function (nodeRef) {
        return '';
    },
    preamble: function (nodeRef) {
        return '';
    },
    document: function (nodeRef) {
        return '\\end{document}';
    },
    beginend: function (nodeRef) {
        return '\\end{' + nodeRef.getAttribute('env') + '}';
    },
    rawlatex: function (nodeRef) {
        return '';
    },
}




function from_xml_to_tex(xml_string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml_string, 'text/xml');
    const xml_obj = doc.documentElement;
    // console.log(xml_obj);

    let output_latex_buffer_arr = [];
    const on_enter_node = function (nodeRef) {
        let mode = '_std';
        if (['xml2tex', 'preamble', 'document', 'rawlatex', 'beginend'].indexOf(nodeRef.tagName) !== -1) {
            mode = nodeRef.tagName;
        };
        const rendered_text = node_renderer_enter[mode](nodeRef);
        output_latex_buffer_arr.push(rendered_text);
    };
    const on_leave_node = function (nodeRef) {
        let mode = '_std';
        if (['xml2tex', 'preamble', 'document', 'rawlatex', 'beginend'].indexOf(nodeRef.tagName) !== -1) {
            mode = nodeRef.tagName;
        };
        const rendered_text = node_renderer_leave[mode](nodeRef);
        output_latex_buffer_arr.push(rendered_text);
    };

    traverseDom(xml_obj, on_enter_node, on_leave_node);

    // console.log(output_latex_buffer_arr);
    return output_latex_buffer_arr.filter(str => !str.match(/^ $/)).join('');
};

module.exports = { from_xml_to_tex };
