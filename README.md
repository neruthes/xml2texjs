# xml2tex (WIP)

A XML-based preprocessing format for generating LaTeX code. Written in JavaScript. Experimental. Unstable.


## Getting Started

```sh
./make.sh testcases/
```


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
