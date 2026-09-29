import { EditProduct } from "./edit-product";

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  return <EditProduct id={id} />;
}
