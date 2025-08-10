import { NewTopicForm } from '@/components/NewTopicForm'

export default function NewTopicPage() {
  return (
    <div className="max-w-xl mx-auto card p-6">
      <h1 className="font-display text-2xl mb-4">Create a new topic</h1>
      <NewTopicForm />
    </div>
  )
}