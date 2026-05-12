"use client"

import { AnimatePresence, motion } from "motion/react"
import { CheckCircle2, XCircle, X, FolderOpen } from "lucide-react"
import { useConfigStore } from "@/lib/store"
import { cn } from "@/lib/utils"

function ModalContent() {
  const results = useConfigStore((s) => s.generateResults)
  const closeModal = useConfigStore((s) => s.closeModal)

  if (!results) return null

  const created = results.filter((r) => r.status === "created").length
  const errors = results.filter((r) => r.status === "error").length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={closeModal}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ ease: [0.2, 0.7, 0.2, 1], duration: 0.3 }}
        className="relative w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* close */}
        <button
          onClick={closeModal}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={14} />
        </button>

        {/* title */}
        <div className="mb-4">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
            Generated Files
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {created} created{errors > 0 && `, ${errors} failed`}
          </p>
        </div>

        {/* results list */}
        <div className="flex flex-col gap-1.5">
          {results.map((r) => (
            <div
              key={r.filename}
              className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2"
            >
              {r.status === "created" ? (
                <CheckCircle2
                  size={12}
                  className="shrink-0 text-muted-foreground"
                />
              ) : (
                <XCircle size={12} className="shrink-0 text-destructive" />
              )}
              <span className="font-mono text-[11px] text-foreground truncate">
                {r.filename}
              </span>
              <span
                className={cn(
                  "ml-auto shrink-0 font-mono text-[9px] uppercase tracking-[0.1em]",
                  r.status === "created"
                    ? "text-muted-foreground"
                    : "text-destructive"
                )}
              >
                {r.status}
              </span>
            </div>
          ))}
        </div>

        {/* footer */}
        {created > 0 && (
          <div className="mt-4 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <FolderOpen size={11} />
            <span className="font-mono">./generated/</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export function GenerateModal() {
  const results = useConfigStore((s) => s.generateResults)

  return (
    <AnimatePresence>
      {results && <ModalContent key="modal" />}
    </AnimatePresence>
  )
}
