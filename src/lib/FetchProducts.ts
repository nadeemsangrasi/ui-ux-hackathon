import { client } from "@/sanity/lib/client";

export const getProductsFromSanity = async () => {
  const query = `*[_type == "product"]{
  _id,
  name,
  images[] {
    "url": asset->url
  },
  imagePath,
  price,
  description,
  discountPercentage,
  isFeaturedProduct,
  stockLevel,
  category
}
`;

  const res = await client.fetch(query);

  return res;
};
