# xml2tex (WIP)

A XML-based preprocessing format for generating LaTeX code. Written in JavaScript. Experimental. Unstable.


## Getting Started

```sh
./make.sh testcases/
```

See how [ar1.tex.xml](https://github.com/neruthes/xml2texjs/blob/master/testcases/ar1.tex.xml)
gets converted to [ar1.tex](https://github.com/neruthes/xml2texjs/blob/master/testcases/ar1.tex)
and how the [final PDF](https://pub-714f8d634e8f451d9f2fe91a4debfa23.r2.dev/xml2texjs/bbee28583ac58510f28399f4/ar1.pdf) looks like.


## Overview

### Basic Layout
```xml
<xml2tex>
    <preamble>
        ...
    </preamble>
    <document>
        ...
    </document>
</xml2tex>
```

### Using Tags

#### Special tags

| Tag      | Description                         |
| -------- | ----------------------------------- |
| xml2tex  | Root element for parser recognition |
| preamble | Preamble                            |
| document | `\begin{document}\end{document}`    |
| beginend | `\begin{...}\end{...}`              |
| rawlatex | Pass raw string to output           |




## Syntax

### Plain Command

```xml
<par />
```

```tex
\par
```

### Command with content
```xml
<section>First Section</section>
```

```tex
\section{First Section}
```

### Command ending with asterisk
```xml
<section_STAR>First Section</section_STAR>
```

```tex
\section*{First Section}
```

### Command with params

```xml
<parbox params="[t][100pt][t]">Hello World</parbox>
```

```tex
\parbox[t][100pt][t]{Hello World}
```

### Environment

```xml
<beginend env="center">
Content
</beginend>
```

```tex
\begin{center}
Content
\end{center}
```

### Environment with bracket options

```xml
<beginend env="tcolorbox" params="[colback=black!3!white, colframe=black]">
...
</beginend>
```

```tex
\begin{tcolorbox}[colback=black!3!white, colframe=black]
...
\end{tcolorbox}
```

### Environment with sophisticated invocation

```xml
<beginend env="tabularx">
<rawlatex>{\linewidth}{llX}</rawlatex>
...
</beginend>
```

```tex
\begin{tabularx}{\linewidth}{llX}
...
\end{tabularx}
```






## Copyright

Copyright (c) 2025 Neruthes.

Published with GNU GPL 2.0 license.
