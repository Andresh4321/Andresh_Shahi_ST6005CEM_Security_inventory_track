import { ReactNode } from "react";
import AdminLayout from "./AdminLayout";

export default async function AdminLayout_({ children }: { children: ReactNode }) {
    return (
        <AdminLayout>
            {children}
        </AdminLayout>
    );
}
