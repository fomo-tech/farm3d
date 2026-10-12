// Node checks exercise game logic; browser-only stylesheet imports have no runtime effect here.
export async function load(url, context, nextLoad) {
  if (url.endsWith('.css')) return { format:'module', source:'export default {};', shortCircuit:true };
  return nextLoad(url, context);
}
