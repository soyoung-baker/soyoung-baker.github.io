export function assetPrefixPath(path: string) {
  return process.env.NODE_ENV === 'production' ? `${process.env.NEXT_PUBLIC_URL}${path}` : path
}
