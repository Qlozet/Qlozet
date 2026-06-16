"use client"
import React, { Suspense } from "react"
import AddClothingTemplate from "@/pattern/products/templates/add-clothing-template"

export const dynamic = 'force-dynamic';

const AddProductPage: React.FC = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AddClothingTemplate />
        </Suspense>
    )
}

export default AddProductPage
