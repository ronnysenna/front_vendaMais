import { NextRequest, NextResponse } from "next/server"
import { getProtectedSession } from "@/lib/get-protected-session"
import { prisma } from "@/lib/prisma"
import { cloudinary } from "@/lib/cloudinary"

export async function GET() {
  const session = await getProtectedSession()

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      phone: true,
      cpfCnpj: true,
      address: true,
      image: true,
    },
  })

  return NextResponse.json(user)
}

export async function PATCH(req: NextRequest) {
  const session = await getProtectedSession()
  const formData = await req.formData()

  const name = formData.get("name") as string
  const phone = formData.get("phone") as string
  const cpfCnpj = formData.get("cpfCnpj") as string
  const address = formData.get("address") as string
  const imageFile = formData.get("image") as File | null

  let imageUrl: string | undefined = undefined

  if (imageFile && typeof imageFile === "object") {
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "venda-mais/perfis" }, (error, result) => {
          if (error || !result) return reject(error)
          resolve(result)
        })
        .end(buffer)
    })

    imageUrl = uploadResult.secure_url
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      phone,
      cpfCnpj,
      address,
      ...(imageUrl && { image: imageUrl }),
    },
  })

  return NextResponse.json({ ok: true })
}
