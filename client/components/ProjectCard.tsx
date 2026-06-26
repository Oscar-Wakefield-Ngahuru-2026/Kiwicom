interface Props {
  fullName: string
  description: string
  imgUrl?: string
  tags?: string[]
}

export default function ProjectCard({
  fullName,
  description,
  imgUrl,
  tags,
}: Props) {
  return (
    <div>
      {imgUrl && <img src={imgUrl} alt={fullName} />}

      <h3>{fullName}</h3>
      <p>{description}</p>
      <>
        {tags?.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </>
    </div>
  )
}
