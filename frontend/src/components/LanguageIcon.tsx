import python from '../assets/python.svg';
import cpp from '../assets/cpp.svg';
import typescript from '../assets/typescript.svg';

type Props = {
  lang: string;
}

export function LanguageIcon({ lang }: Props) {
  let src = '';

  switch (lang.toLowerCase()) {
    case 'python':
      src = python;
      break;
    case 'cpp':
      src = cpp;
      break;
    case 'typescript':
      src = typescript
      break;
    default:
      return null;
  }

  return (
    <img
      src={src}
      alt={`${lang} icon`}
      style={{ maxWidth: 26 }}
      loading="lazy"
      draggable={false}
    />
  );
}