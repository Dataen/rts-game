import CodeMirror, { type Extension } from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { useEffect, useState } from 'react';
import type { BotLanguage } from '../types/Bot';
import { vscodeDark } from '@uiw/codemirror-theme-vscode'

type Props = {
    value: string;
    language: BotLanguage;
    onChange?: (val: string) => void;
    onBlur?: () => void;
};

const pythonExtensions = [python()];
const typescriptExtensions = [javascript({ jsx: true, typescript: true })];
const cppExtensions = [cpp()];

export function CodeEditor({ value, language = "python", onChange, onBlur }: Props) {
    const [extensions, setExtensions] = useState<Extension[]>([]);

    useEffect(() => {
        switch (language) {
            case 'python':
                setExtensions(pythonExtensions)
                break;
            case 'typescript':
                setExtensions(typescriptExtensions)
                break;
            case 'cpp':
                setExtensions(cppExtensions)
                break;
        }
    }, [language]);

    return <CodeMirror
        value={value}
        height="200px"
        theme={vscodeDark}
        extensions={extensions}
        onChange={onChange}
        onBlur={onBlur}
    />;
}