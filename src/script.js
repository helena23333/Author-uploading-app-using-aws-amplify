import Amplify, { Auth, DataStore, Storage } from 'aws-amplify'
import { Post, Author } from './models'
import config from './aws-exports'

Amplify.configure(config)

let currentUser = null

const toggleNavBar = () => {
  if (currentUser) {
    document.querySelector('.logged-in').classList.add('hidden')
    document.querySelector('.logged-in').classList.add('hidden')
    document.querySelector('#sign-out').classList.remove('hidden')
    document.querySelector('#create-post').classList.remove('hidden')
  } else {
    document.querySelector('.logged-in').classList.remove('hidden')
    document.querySelector('.logged-in').classList.remove('hidden')
    document.querySelector('#sign-out').classList.add('hidden')
    document.querySelector('#create-post').classList.add('hidden')
  }
}

const getCurrentUser = async () => {
  try {
    currentUser = await Auth.currentAuthenticatedUser()
  } catch (err) {
    console.log('error getting user', err)
    currentUser = null
  }
  toggleNavBar()
}
getCurrentUser()

// const pullData = async () => {
//   try {
//     const posts = await DataStore.query(Post)
//     console.log(posts)
//   } catch (err) {
//     console.log(err)
//   }
// }

const pullData = async () => {
  try {
    const posts = await DataStore.query(Post)
    const postsWithPics = []

    for (const post of posts) {
      try {
        const postPic = await Storage.get(post.image)
        postsWithPics.push({
          description: post.description,
          pic: postPic
        })
      } catch (err) {
        postsWithPics.push({
          description: post.description,
          pic: post.link
        })
      }
    }
    // console.log(postsWithPics)
    const postsDiv = document.querySelector('.posts')
    postsWithPics.map(post => {
      const postDiv = document.createElement('div')
      postDiv.classList.add('post')
      const img = document.createElement('img')
      const p = document.createElement('p')
      p.innerText = post.description
      img.setAttribute('src', post.pic)
      postDiv.appendChild(img)
      postDiv.appendChild(p)
      postsDiv.appendChild(postDiv)
    })
  } catch (error) {
    console.error(error)
  }
}

pullData()

// document.getElementById('create-post').addEventListener('click', async e => {
//   e.preventDefault()

//   try {
//     const newPost = await DataStore.save(new Post({
//       description: 'Felt cute might delete',
//       // copy the link below here
//       link: 'https://binaryville.com/images/characters/dolores-disc.png'
//     }))
//     console.log(newPost)
//   } catch (err) {
//     console.log(err)
//   }
// })

document.getElementById('create-post').addEventListener('submit', async e => {
  e.preventDefault()

  try {
    const file = document.getElementById('img').files[0]

    await Storage.put(file.name, file)

    const newPost = await DataStore.save(new Post({
      description: document.getElementById('description').value,
      image: file.name
    })).then(() => {
      alert("Post success!")
      window.location.reload()
    })

    console.log(newPost)
    window.location.reload()
    
  } catch (err) {
    alert("Post failed with error: " + error)
  }
})

document.getElementById('sign-out').addEventListener('click', async () => {
  await Auth.signOut()
  window.location.href = '/'
})

// link: https://binaryville.com/images/characters/dolores-disc.png
