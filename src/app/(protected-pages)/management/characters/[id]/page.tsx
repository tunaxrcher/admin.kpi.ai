import CharacterDetailPage from '../../../../../features/characters/components/CharacterDetailPage'

interface PageProps {
  params: {
    id: string
  }
}

export default function CharacterDetailPageRoute({ params }: PageProps) {
  return <CharacterDetailPage characterId={parseInt(params.id)} />
}
