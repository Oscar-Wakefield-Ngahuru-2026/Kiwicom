import * as Path from 'node:path'
import express from 'express'
import cors, { CorsOptions } from 'cors'
import projectsRouter from './routes/projects'
import profileRouter from './routes/profiles'
import bookmarksRouter from './routes/bookmarks'

const server = express()

server.use(express.json())
server.use(cors('*' as CorsOptions))

server.get('/api/v1/greeting', (req, res) => {
  const greetings = ['hola', 'hi', 'hello', 'howdy']
  const index = Math.floor(Math.random() * greetings.length)
  console.log(index)
  res.json({ greeting: greetings[index] })
})

server.use('/api/v1/projects', projectsRouter)
server.use('/api/v1/bookmarks', bookmarksRouter)
server.use('/api/v1/profiles', profileRouter)

if (process.env.NODE_ENV === 'production') {
  server.use(express.static(Path.resolve('public')))
  server.use('/assets', express.static(Path.resolve('./dist/assets')))
  server.get('*', (req, res) => {
    res.sendFile(Path.resolve('./dist/index.html'))
  })
}

export default server
