interface Props {
  name: string
  description: string
  imgUrl?: string
  tags?: string[]
}

export default function ProjectCard({
  name,
  description,
  imgUrl,
  tags,
}: Props) {
  return (
    <div>
      {imgUrl && <img src={imgUrl} alt={name} />}

      <h3>{name}</h3>
      <p>{description}</p>
      <>
        {tags?.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </>
    </div>
  )
}
