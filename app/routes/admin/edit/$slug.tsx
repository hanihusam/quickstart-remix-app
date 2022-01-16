import {
  useActionData,
  useTransition,
  Form,
  useLoaderData,
  redirect,
} from 'remix'
import type {LoaderFunction, ActionFunction} from 'remix'
import invariant from 'tiny-invariant'

import {getPost} from '~/post'
import {createPost} from '~/post'

type PostError = {
  title?: boolean
  slug?: boolean
  markdown?: boolean
}

export let action: ActionFunction = async ({request}) => {
  await new Promise(res => setTimeout(res, 1000))
  let formData = await request.formData()

  let title = formData.get('title')
  let slug = formData.get('slug')
  let markdown = formData.get('markdown')

  let errors: PostError = {}
  if (!title) errors.title = true
  if (!slug) errors.slug = true
  if (!markdown) errors.markdown = true

  if (Object.keys(errors).length) {
    return errors
  }

  invariant(typeof title === 'string')
  invariant(typeof slug === 'string')
  invariant(typeof markdown === 'string')

  await createPost({title, slug, markdown})

  return redirect('/admin')
}

export let loader: LoaderFunction = async ({params}) => {
  invariant(params.slug, 'expected params.slug')
  return getPost(params.slug)
}

export default function EditPost() {
  let errors = useActionData()
  let post = useLoaderData()
  let transition = useTransition()

  return (
    <Form method="post">
      <p>
        <label>
          Post Title: {errors?.title && <em>Title is required</em>}
          <input type="text" name="title" defaultValue={post.title} />
        </label>
      </p>
      <p>
        <label>
          Post Slug: {errors?.slug && <em>Slug is required</em>}
          <input type="text" name="slug" defaultValue={post.slug} />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">Markdown:</label>{' '}
        {errors?.markdown && <em>Markdown is required</em>}
        <br />
        <textarea rows={20} name="markdown" defaultValue={post.markdown} />
      </p>
      <p>
        <button type="submit">
          {transition.submission ? 'Updating...' : 'Edit Post'}
        </button>
      </p>
    </Form>
  )
}
