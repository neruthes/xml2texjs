const fs = require('fs');
const child_process = require('child_process');
const { DOMParser } = require('xmldom');



function traverseDom(node, enterCallback, leaveCallback) {
    if (node) {
        enterCallback(node);
        for (let child = node.firstChild; child; child = child.nextSibling) {
            traverseDom(child, enterCallback, leaveCallback);
        };
        leaveCallback(node);
    };
};



const NODE_TYPE_ELEMENT = 1;
const NODE_TYPE_TEXT = 3;

const node_renderer_enter = {
    _std: function (nodeRef, session_obj, document_obj) {
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
    xml2tex: function (nodeRef, session_obj, document_obj) {
        return '';
    },
    preamble: function (nodeRef, session_obj, document_obj) {
        return '';
    },
    document: function (nodeRef, session_obj, document_obj) {
        return '\\begin{document}';
    },
    beginend: function (nodeRef, session_obj, document_obj) {
        let tmpstr = '\\begin{' + nodeRef.getAttribute('env') + '}';
        // Add params
        if (nodeRef.getAttribute('params')) {
            tmpstr += nodeRef.getAttribute('params');
        };
        return tmpstr;
    },
    rawlatex: function (nodeRef, session_obj, document_obj) {
        return '';
    },
    content: function (nodeRef, session_obj, document_obj) {
        return '{';
    },
    multicontent: function (nodeRef, session_obj, document_obj) {
        let tmpstr = '\\' + nodeRef.getAttribute('cmd');
        // Add params
        if (nodeRef.getAttribute('params')) {
            tmpstr += nodeRef.getAttribute('params');
        };
        return tmpstr;
    },
    FANCY_CONVERT: function (nodeRef, session_obj, document_obj) {
        // console.error(nodeRef.textContent);
        return '';
    },
}
const node_renderer_leave = {
    _std: function (nodeRef, session_obj, document_obj) {
        if (nodeRef.nodeType === NODE_TYPE_ELEMENT) {
            if (nodeRef.childNodes.length > 0) {
                return '}';
            };
        }
        return '';
    },
    xml2tex: function (nodeRef, session_obj, document_obj) {
        return '';
    },
    preamble: function (nodeRef, session_obj, document_obj) {
        return '';
    },
    document: function (nodeRef, session_obj, document_obj) {
        return '\\end{document}';
    },
    beginend: function (nodeRef, session_obj, document_obj) {
        return '\\end{' + nodeRef.getAttribute('env') + '}';
    },
    rawlatex: function (nodeRef, session_obj, document_obj) {
        return '';
    },
    content: function (nodeRef, session_obj, document_obj) {
        return '}';
    },
    multicontent: function (nodeRef, session_obj, document_obj) {
        return '';
    },
    FANCY_CONVERT: function (nodeRef, session_obj, document_obj) {
        // Example: <FANCY_CONVERT filter="table2tabu" filter-params="{lX}" filter-argv="{}">
        const filter_ref = session_obj.fancy_converters[nodeRef.getAttribute('filter')];
        if (filter_ref) {
            return filter_ref({
                nodeRef, session_obj,
                cdata: nodeRef.textContent,
                params: nodeRef.getAttribute('filter-params'),
                argv: nodeRef.getAttribute('filter-argv'),
            }, document_obj);
        };
        return `<FANCY_CONVERT><${nodeRef.textContent}>`;
    },
}



function _space_pad(length) {
    return (new Array(Math.max(0, length))).fill('    ').join('');
}
function serialize_tokens(tokens_arr) {
    let state_level_depth = 0;
    let final_output = '';
    let cached_prev_token = '';
    tokens_arr.forEach(token => {
        let before_token = '';
        let after_token = '';
        let indent_padding = '';
        // Before pushing serialize token
        if (token === '\\par' || token.endsWith('\\\\')) {
            after_token = '%\n';
        };
        if (token === '}') {
            after_token = '%\n';
        };
        // Work with indenting
        if (token.startsWith('\\end{')) {
            state_level_depth += -1;
            before_token = '%\n';
            after_token = '%\n';
        };
        if (token.startsWith('\\begin{')) {
            // Should add 1 to `state_level_depth` but not now!
            before_token = '%\n';
            after_token = '%\n';
        };
        // If previous token is a single command, and this token is plain text, prepend a whitespace
        // This is useful when working with \hline, \toprule, etc
        if (cached_prev_token.match(/^\\\w+$/) && token.match(/^\w/)) {
            before_token += ' ';
        };
        
        if (final_output.endsWith('\n') || before_token.endsWith('\n')) {
            indent_padding = _space_pad(state_level_depth);
        };
        let tmp_result = before_token + indent_padding + token.replace(/^\n /, '') + after_token;
        final_output += tmp_result;
        // Clean up
        if (token.startsWith('\\begin{')) {
            state_level_depth += 1;
        };
        cached_prev_token = token;
    });
    return final_output;
}



const from_xml_to_tex = function (xml_string, input_document_obj) {
    // `this` points to a `session_obj`?
    // console.error(this);
    const _session_obj = this;
    const document_obj = {
        ...input_document_obj,
        RAM: {}
    };
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml_string, 'text/xml');
    const xml_obj = doc.documentElement;
    // console.log(xml_obj);

    const _special_modes_list = ['xml2tex', 'preamble', 'document', 'rawlatex', 'beginend', 'multicontent', 'content', 'FANCY_CONVERT'];
    let output_latex_tokens_arr = [];
    const on_enter_node = function (nodeRef) {
        let mode = '_std';
        if (_special_modes_list.indexOf(nodeRef.tagName) !== -1) {
            mode = nodeRef.tagName;
        };
        const rendered_text = node_renderer_enter[mode](nodeRef, _session_obj, document_obj);
        output_latex_tokens_arr.push(rendered_text);
    };
    const on_leave_node = function (nodeRef) {
        let mode = '_std';
        if (_special_modes_list.indexOf(nodeRef.tagName) !== -1) {
            mode = nodeRef.tagName;
        };
        const rendered_text = node_renderer_leave[mode](nodeRef, _session_obj, document_obj);
        output_latex_tokens_arr.push(rendered_text);
    };

    traverseDom(xml_obj, on_enter_node, on_leave_node);

    const new_arr = output_latex_tokens_arr.filter(
        str => str != undefined
    ).filter(
        str => str.replace(/[\n\s]/g, '').length > 0
    );
    // console.error(new_arr);
    return serialize_tokens(new_arr).replace(/\n%\n/g, '\n%%%%%%%%\n');
};






const _default_fancy_converters = {
    html_table_to_pandoc: function (task_obj) {
        const pandoc_proc = child_process.spawnSync(`pandoc`, ['-f', 'html', '-t', 'latex'], {input: task_obj.cdata});
        let out_str = pandoc_proc.stdout.toString();
        return out_str;
    },
    markdown_to_pandoc: function (task_obj) {
        const pandoc_proc = child_process.spawnSync(`pandoc`, ['-f', 'markdown', '-t', 'latex'], {input: task_obj.cdata});
        let out_str = pandoc_proc.stdout.toString();
        return out_str;
    },
    svg_code_with_png: function (task_obj, document_obj) {
        let counter = document_obj.RAM.svg_code_with_png__counter || 0;
        document_obj.RAM.svg_code_with_png__counter = counter + 1;
        let default_config_obj = {
            png_prefix: '.tmp/'
        };
        let active_config_obj = { ...default_config_obj };
        try {
            let filter_argv_parsed = JSON.parse(task_obj.argv);
            active_config_obj = { ...active_config_obj, ...filter_argv_parsed };
        } catch (e) {
            // Do nothing
        };
        // `\svgcodewithpng` argv: png_path, svg_code
        let cmd_def = `\\providecommand{\\svgcodewithpng}[2]{%
\\includegraphics[width=0.8\\linewidth]{#1}\\par%
#2\\par
}`;
        const svg_text = task_obj.cdata;
        // const hash_proc = child_process.spawnSync(`sha256sum`, [], { input: task_obj.cdata });
        // const hash_str = hash_proc.stdout.toString().slice(0,15);
        const document_identifier = document_obj.basename;
        const svg_path = active_config_obj.png_prefix + document_identifier + '--' + document_obj.RAM.svg_code_with_png__counter + '.svg';
        const png_path = active_config_obj.png_prefix + document_identifier + '--' + document_obj.RAM.svg_code_with_png__counter + '.png';
        // console.error(`png_path`, png_path);
        fs.writeFileSync(svg_path, task_obj.cdata);
        const rsvgconvert_proc = child_process.spawnSync(`rsvg-convert`, [svg_path, '-h', process.env.SVG_HEIGHT || '1000', '-o', png_path]);
        if (rsvgconvert_proc.error) {
            console.error(`Fancy converter svg_code_with_png failed!`);
            process.exit(rsvgconvert_proc.error);
        };
        const out_str = cmd_def + `\\svgcodewithpng{${png_path}}{%
\\begin{lstlisting}
${
    svg_text.trim()
    // .replace(/#/g, '\\#')
}
\\end{lstlisting}}`;
        return out_str;
    },
};





function new_session() {
    let session_obj = {};
    session_obj.from_xml_to_tex = from_xml_to_tex;
    session_obj.fancy_converters = { ..._default_fancy_converters };
    return session_obj;
}


module.exports = { new_session };
