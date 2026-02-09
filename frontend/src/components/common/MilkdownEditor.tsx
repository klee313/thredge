import { useEffect, useMemo, useRef } from 'react'
import { Editor } from '@milkdown/core'
import { rootCtx, defaultValueCtx, editorViewOptionsCtx, commandsCtx } from '@milkdown/core'
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react'
import { gfm } from '@milkdown/preset-gfm'
import { commonmark, sinkListItemCommand, liftListItemCommand, listItemSchema } from '@milkdown/preset-commonmark'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { history } from '@milkdown/plugin-history'
import { undoInputRule } from '@milkdown/prose/inputrules'
import { Fragment } from '@milkdown/prose/model'
import { TextSelection } from '@milkdown/prose/state'
import { $useKeymap } from '@milkdown/utils'
import { nord } from '@milkdown/theme-nord'

const undoInputRuleKeymap = $useKeymap('undoInputRule', {
  UndoInputRule: {
    shortcuts: 'Mod-z',
    priority: 100,
    command: () => undoInputRule,
  },
})

const listIndentKeymap = $useKeymap('listIndent', {
  IndentListItem: {
    shortcuts: 'Tab',
    priority: 90,
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      const listItemType = listItemSchema.type(ctx)
      return (state, dispatch) => {
        const { selection } = state
        if (!(selection instanceof TextSelection)) {
          return commands.call(sinkListItemCommand.key)
        }

        const { $from } = selection
        let itemDepth = -1
        for (let depth = $from.depth; depth > 0; depth -= 1) {
          if ($from.node(depth).type === listItemType) {
            itemDepth = depth
            break
          }
        }
        if (itemDepth === -1) {
          return commands.call(sinkListItemCommand.key)
        }

        const listDepth = itemDepth - 1
        if (listDepth < 0) {
          return commands.call(sinkListItemCommand.key)
        }

        const listNode = $from.node(listDepth)
        if (!listNode || listNode.type.name !== 'ordered_list') {
          return commands.call(sinkListItemCommand.key)
        }

        const indexInList = $from.index(listDepth)
        if (indexInList === 0) {
          return commands.call(sinkListItemCommand.key)
        }

        const bulletListType = state.schema.nodes.bullet_list
        if (!bulletListType) {
          return commands.call(sinkListItemCommand.key)
        }

        const currentItem = listNode.child(indexInList)
        const prevItem = listNode.child(indexInList - 1)
        const prevLastIndex = prevItem.childCount - 1
        const prevLastChild = prevItem.lastChild
        const hasBulletList = prevLastChild?.type === bulletListType

        const bulletAttrs = {
          ...currentItem.attrs,
          listType: 'bullet',
          label: '•',
        }
        const bulletItem = listItemType.create(bulletAttrs, currentItem.content)

        const nextBulletList = hasBulletList
          ? prevLastChild.copy(prevLastChild.content.append(Fragment.from(bulletItem)))
          : bulletListType.create(listNode.attrs, bulletItem)

        const nextPrevContent = hasBulletList
          ? prevItem.content.replaceChild(prevLastIndex, nextBulletList)
          : prevItem.content.append(Fragment.from(nextBulletList))
        const nextPrevItem = prevItem.copy(nextPrevContent)

        const nextChildren = []
        for (let i = 0; i < listNode.childCount; i += 1) {
          if (i === indexInList - 1) {
            nextChildren.push(nextPrevItem)
          } else if (i === indexInList) {
            continue
          } else {
            nextChildren.push(listNode.child(i))
          }
        }

        const nextList = listNode.type.create(listNode.attrs, nextChildren)
        const listPos = $from.before(listDepth)
        const tr = state.tr.replaceWith(listPos, listPos + listNode.nodeSize, nextList)

        const mappedListPos = tr.mapping.map(listPos)
        let pos = mappedListPos + 1
        for (let i = 0; i < indexInList - 1; i += 1) {
          pos += nextChildren[i].nodeSize
        }
        const bulletIndex = hasBulletList ? prevLastIndex : nextPrevItem.childCount - 1
        pos += 1
        for (let i = 0; i < bulletIndex; i += 1) {
          pos += nextPrevItem.child(i).nodeSize
        }
        const bulletListNode = nextPrevItem.child(bulletIndex)
        pos += 1
        const targetIndex = bulletListNode.childCount - 1
        for (let i = 0; i < targetIndex; i += 1) {
          pos += bulletListNode.child(i).nodeSize
        }
        tr.setSelection(TextSelection.near(tr.doc.resolve(pos + 1)))

        if (dispatch) {
          dispatch(tr)
        }
        return true
      }
    },
  },
  OutdentListItem: {
    shortcuts: 'Shift-Tab',
    priority: 90,
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(liftListItemCommand.key)
    },
  },
})

type MilkdownEditorProps = {
  initialValue: string
  onChange: (value: string) => void
  placeholder?: string
  minHeightClass: string
  isDisabled?: boolean
  resetKey?: number
  className?: string
  valueForPlaceholder?: string
  containerRef?: (element: HTMLDivElement | null) => void
}

const baseClass =
  'w-full rounded-md border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 py-2 text-sm text-[var(--theme-ink)]'

function MilkdownEditorInner({
  initialValue,
  onChange,
  isDisabled = false,
  resetKey = 0,
}: Pick<MilkdownEditorProps, 'initialValue' | 'onChange' | 'isDisabled' | 'resetKey'>) {
  const onChangeRef = useRef(onChange)
  const lastMarkdownRef = useRef(initialValue)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEditor(
    (root) =>
      Editor.make()
        .config((ctx) => {
          ctx.set(rootCtx, root)
          ctx.set(defaultValueCtx, initialValue)
          ctx.set(editorViewOptionsCtx, {
            editable: () => !isDisabled,
          })
          ctx.get(listenerCtx).markdownUpdated((_, markdown) => {
            if (markdown === lastMarkdownRef.current) {
              return
            }
            lastMarkdownRef.current = markdown
            onChangeRef.current(markdown)
          })
        })
        .config(nord)
        .use(commonmark)
        .use(gfm)
        .use(listener)
        .use(listIndentKeymap)
        .use(undoInputRuleKeymap)
        .use(history),
    [resetKey, isDisabled],
  )

  return <Milkdown />
}

export function MilkdownEditor({
  initialValue,
  onChange,
  placeholder,
  minHeightClass,
  isDisabled = false,
  resetKey = 0,
  className,
  valueForPlaceholder,
  containerRef,
}: MilkdownEditorProps) {
  const localContainerRef = useRef<HTMLDivElement | null>(null)
  const placeholderValue = valueForPlaceholder ?? initialValue
  const showPlaceholder = Boolean(placeholder && !placeholderValue.trim())
  const wrapperClass = useMemo(
    () => `${minHeightClass} ${baseClass} relative ${className ?? ''}`,
    [minHeightClass, className],
  )

  return (
    <div
      className={wrapperClass}
      ref={(element) => {
        localContainerRef.current = element
        containerRef?.(element)
      }}
      onMouseDown={(event) => {
        if (isDisabled) {
          return
        }
        if (event.defaultPrevented) {
          return
        }
        const editor = localContainerRef.current?.querySelector<HTMLElement>('.editor')
        if (editor && document.activeElement !== editor) {
          requestAnimationFrame(() => {
            editor.focus()
          })
        }
      }}
    >
      <MilkdownProvider>
        <MilkdownEditorInner
          key={resetKey}
          initialValue={initialValue}
          onChange={onChange}
          isDisabled={isDisabled}
          resetKey={resetKey}
        />
      </MilkdownProvider>
      {showPlaceholder && (
        <div className="pointer-events-none absolute left-3 top-2 text-sm text-[var(--theme-muted)] opacity-60">
          {placeholder}
        </div>
      )}
    </div>
  )
}
