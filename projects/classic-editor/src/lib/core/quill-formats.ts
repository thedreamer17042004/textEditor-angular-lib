import Quill from 'quill';
import { fontWhitelist, SIZE_OPTIONS } from '../config';

/** Register Quill style attributors used by the Classic toolbar. */
export function setupQuillFormats(): void {
  const SizeStyle = Quill.import('attributors/style/size') as { whitelist?: string[] };
  SizeStyle.whitelist = [...SIZE_OPTIONS];
  Quill.register(SizeStyle as any, true);

  const FontStyle = Quill.import('attributors/style/font') as { whitelist?: string[] };
  FontStyle.whitelist = fontWhitelist();
  Quill.register(FontStyle as any, true);
}
