'use client'
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface Common { label: string; error?: string; hint?: string; className?: string }

export function Field({ label, error, hint, className = '', id, ...rest }: Common & InputHTMLAttributes<HTMLInputElement>) {
  const fid = id || `f-${rest.name}`
  return (
    <div className={className}>
      <label htmlFor={fid} className="lbl">{label}{rest.required && <span className="text-forest"> *</span>}</label>
      <input id={fid} aria-invalid={!!error} aria-describedby={error ? `${fid}-e` : undefined} className={`field ${error ? 'field-err' : ''}`} {...rest} />
      {hint && !error && <p className="mt-1.5 text-xs text-faint">{hint}</p>}
      {error && <p id={`${fid}-e`} className="err-text">{error}</p>}
    </div>
  )
}

export function TextArea({ label, error, hint, className = '', id, ...rest }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const fid = id || `f-${rest.name}`
  return (
    <div className={className}>
      <label htmlFor={fid} className="lbl">{label}{rest.required && <span className="text-forest"> *</span>}</label>
      <textarea id={fid} rows={4} aria-invalid={!!error} aria-describedby={error ? `${fid}-e` : undefined} className={`field resize-y ${error ? 'field-err' : ''}`} {...rest} />
      {hint && !error && <p className="mt-1.5 text-xs text-faint">{hint}</p>}
      {error && <p id={`${fid}-e`} className="err-text">{error}</p>}
    </div>
  )
}

export function Select({ label, error, hint, className = '', id, options, placeholder, ...rest }: Common & SelectHTMLAttributes<HTMLSelectElement> & { options: (string | { value: string; label: string })[]; placeholder?: string }) {
  const fid = id || `f-${rest.name}`
  return (
    <div className={className}>
      <label htmlFor={fid} className="lbl">{label}{rest.required && <span className="text-forest"> *</span>}</label>
      <select id={fid} aria-invalid={!!error} className={`field appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22 fill=%22none%22 stroke=%22%239a7644%22 stroke-width=%221.5%22><path d=%22M1 1l5 5 5-5%22/></svg>')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10 ${error ? 'field-err' : ''}`} {...rest}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => {
          const v = typeof o === 'string' ? o : o.value
          const l = typeof o === 'string' ? o : o.label
          return <option key={v} value={v}>{l}</option>
        })}
      </select>
      {hint && !error && <p className="mt-1.5 text-xs text-faint">{hint}</p>}
      {error && <p className="err-text">{error}</p>}
    </div>
  )
}

/** Hidden anti-spam field — real people never fill it in. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
    </div>
  )
}

export function Alert({ kind, title, children }: { kind: 'error' | 'success' | 'info'; title?: string; children?: ReactNode }) {
  const styles = { error: 'border-[#d9a99b] bg-[#fbeee9] text-[#7a2f20]', success: 'border-[#b9c9a4] bg-[#f1f5ea] text-[#3d4f27]', info: 'border-line bg-sand text-ink' }[kind]
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={`flex gap-3 border px-4 py-3 text-sm ${styles}`}>
      {kind === 'error' ? <AlertCircle size={18} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={18} className="mt-0.5 shrink-0" />}
      <div className="leading-6">{title && <p className="font-medium">{title}</p>}{children}</div>
    </div>
  )
}

export function Spinner({ className = '' }: { className?: string }) {
  return <span className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} aria-hidden />
}

export function formString(fd: FormData, k: string) { return String(fd.get(k) ?? '').trim() }
export function isSpam(fd: FormData) { return formString(fd, 'website') !== '' }
