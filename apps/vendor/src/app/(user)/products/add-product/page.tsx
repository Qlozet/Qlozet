"use client"
import React, { Suspense } from "react"
import AddProductTemplate from "@/pattern/products/templates/add-product-template"

export const dynamic = 'force-dynamic';

const AddProductPage: React.FC = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AddProductTemplate />
        </Suspense>
    )
}

export default AddProductPage
