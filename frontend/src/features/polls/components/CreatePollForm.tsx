import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from '@tanstack/react-router'
import { createPollApi } from '#/features/polls/api/pollsApi'

const optionSchema = z.object({
  optionText: z.string().min(1, 'Option text is required'),
})

const questionSchema = z.object({
  questionText: z.string().min(1, 'Question text is required'),
  isMandatory: z.boolean(),
  options: z.array(optionSchema).min(2, 'At least 2 options required'),
})

const createPollSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  isAnonymous: z.boolean(),
  expiresAt: z.string().min(1, 'Expiry date is required'),
  questions: z.array(questionSchema).min(1, 'At least 1 question required'),
})

type CreatePollForm = z.infer<typeof createPollSchema>

export function CreatePollForm() {
  const navigate = useNavigate()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreatePollForm>({
    resolver: zodResolver(createPollSchema),
    defaultValues: {
      title: '',
      isAnonymous: false,
      expiresAt: '',
      questions: [
        {
          questionText: '',
          isMandatory: true,
          options: [{ optionText: '' }, { optionText: '' }],
        },
      ],
    },
  })

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({ control, name: 'questions' })

  const onSubmit = async (data: CreatePollForm) => {
    try {
      await createPollApi(data)
      navigate({ to: '/dashboard' })
    } catch {
      alert('Failed to create poll')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Poll Title
        </label>
        <input
          {...register('title')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g. Team lunch preferences"
        />
        {errors.title && (
          <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Settings Row */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <Controller
            control={control}
            name="isAnonymous"
            render={({ field }) => (
              <input
                type="checkbox"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          Anonymous responses
        </label>
      </div>

      {/* Expiry */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Expires At
        </label>
        <input
          {...register('expiresAt')}
          type="datetime-local"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.expiresAt && (
          <p className="text-red-500 text-xs mt-1">
            {errors.expiresAt.message}
          </p>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {questionFields.map((question, qIndex) => (
          <QuestionField
            key={question.id}
            qIndex={qIndex}
            control={control}
            register={register}
            errors={errors}
            onRemove={() => removeQuestion(qIndex)}
            showRemove={questionFields.length > 1}
          />
        ))}

        <button
          type="button"
          onClick={() =>
            appendQuestion({
              questionText: '',
              isMandatory: true,
              options: [{ optionText: '' }, { optionText: '' }],
            })
          }
          className="text-blue-600 text-sm hover:underline"
        >
          + Add Question
        </button>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Creating...' : 'Create Poll'}
      </button>
    </form>
  )
}

// Separate component for each question
function QuestionField({
  qIndex,
  control,
  register,
  errors,
  onRemove,
  showRemove,
}: any) {
  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({ control, name: `questions.${qIndex}.options` })

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Question {qIndex + 1}
        </span>
        {showRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-red-400 text-xs hover:underline"
          >
            Remove
          </button>
        )}
      </div>

      <input
        {...register(`questions.${qIndex}.questionText`)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="e.g. What is your preference?"
      />
      {errors.questions?.[qIndex]?.questionText && (
        <p className="text-red-500 text-xs">
          {errors.questions[qIndex].questionText.message}
        </p>
      )}

      <label className="flex items-center gap-2 text-sm text-gray-600">
        <Controller
          control={control}
          name={`questions.${qIndex}.isMandatory`}
          render={({ field }) => (
            <input
              type="checkbox"
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />
        Mandatory
      </label>

      {/* Options */}
      <div className="space-y-2 pl-2">
        {optionFields.map((option, oIndex) => (
          <div key={option.id} className="flex gap-2 items-center">
            <input
              {...register(`questions.${qIndex}.options.${oIndex}.optionText`)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Option ${oIndex + 1}`}
            />
            {optionFields.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(oIndex)}
                className="text-red-400 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => appendOption({ optionText: '' })}
          className="text-blue-500 text-xs hover:underline"
        >
          + Add Option
        </button>
      </div>
    </div>
  )
}
