export default function extractCloudinaryPublicId(imageUrl) {
  const parts = imageUrl.split("/");
  const folder = parts.at(-2);
  const fileName = parts.at(-1).split(".")[0];

  return `${folder}/${fileName}`;
}
