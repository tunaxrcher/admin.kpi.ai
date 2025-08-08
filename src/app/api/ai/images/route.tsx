import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling } from '../../../../lib/withErrorHandling'
import { imageData, generatedImageData } from '../../../../mock/data/aiData'
import sleep from '../../../../utils/sleep'

export const GET = withErrorHandling(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams
  const index = parseInt(searchParams.get('index') || '0')
  const itemCount = parseInt(searchParams.get('itemCount') || '4')

  let loadable = true
  const maxGetItem = itemCount
  const count = (index - 1) * maxGetItem
  let images = imageData
  if (count >= images.length) {
    loadable = false
  }
  images = images.slice(count, index * maxGetItem)
  const response = {
    data: images,
    loadable,
  }

  return NextResponse.json(response)
})

export const POST = withErrorHandling(async (request: NextRequest) => {
  const { prompt } = await request.json()

  const imageSet = generatedImageData[
    Math.floor(Math.random() * generatedImageData.length)
  ].map((img) => {
    img.prompt = prompt
    return img
  })

  await sleep(200)

  return NextResponse.json(imageSet)
})
