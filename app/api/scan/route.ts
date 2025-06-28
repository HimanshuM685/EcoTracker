import { NextResponse } from "next/server"
import axios from "axios"

type OpenFoodFactsResponse = {
  product: {
    product_name?: string;
    brands?: string;
  };
  status: number;
  code: string;
};

export async function POST(req: Request) {
  const { barcode } = await req.json()

  if (!barcode) {
    return NextResponse.json({ error: "Barcode missing" }, { status: 400 })
  }

  try {
    const productRes = await axios.get<OpenFoodFactsResponse>(
  `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
);

    const product = productRes.data.product

    if (!product?.product_name) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const estimatedCarbon = Math.random() * 2 + 0.5

    return NextResponse.json({
      productName: product.product_name,
      brand: product.brands || "Unknown",
      carbonEstimate: estimatedCarbon.toFixed(2),
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch product info" },
      { status: 500 }
    )
  }
}
