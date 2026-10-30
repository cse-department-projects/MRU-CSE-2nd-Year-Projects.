import { get, set, del } from 'idb-keyval';
export async function saveImage(file: File): Promise<string> {
  const imageId = `img-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  await set(imageId, file);
  return imageId;
}
export async function getImage(imageId: string): Promise<Blob | undefined> {
  return await get(imageId);
}
export async function deleteImage(imageId: string): Promise<void> {
  await del(imageId);
}
