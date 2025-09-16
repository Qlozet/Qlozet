import { redirect } from "next/navigation";
import { APP_ROUTES } from '@/lib/routes';

export default function ProductsPage(): void {
  redirect(APP_ROUTES.productsCloth);
}
