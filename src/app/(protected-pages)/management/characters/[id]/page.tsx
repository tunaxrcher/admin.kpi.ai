import CharacterDetailPage from '../../../../../features/characters/components/CharacterDetailPage'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CharacterDetailPageRoute({ params }: PageProps) {
  const { id } = await params
  return <CharacterDetailPage characterId={parseInt(id)} />
}
