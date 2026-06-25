interface Props {
  ownerName: string
  imgUrl?: string
  projectName: string
  briefDescription: string
  tags: string[]
}

export default function ProjectCard({
  projectName,
  ownerName,
  briefDescription,ß
  imgUrl,
  tags,
}: Props) {
  return (
    <div>
      {imgUrl && <img src={imgUrl} alt={projectName} />}

      <h3>{projectName}</h3>
      <p>{briefDescription}</p>
      <>
        {tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </>
    </div>
  )
}
