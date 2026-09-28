import { useState } from 'react'
import {
  BRANDS,
  BRAND_MODELS,
  FUEL_TYPES,
  TRANSMISSIONS,
  CONDITIONS,
  SERVICE_HISTORY,
  ACCIDENT_HISTORY,
  YEARS,
} from '../data/carData'

const initialState = {
  brand: '',
  model: '',
  year: '',
  mileage_km: '',
  engine_size_cc: '',
  fuel_type: '',
  transmission: '',
  owner_count: '',
  condition: '',
  service_history: '',
  accident_history: '',
  features_count: '',
}

// All 12 vehicle fields are required — this list is the single source
// of truth for "is the form complete" and for the field-level checks.
// Unchanged from before: same keys, same /predict payload shape.
const REQUIRED_FIELDS = Object.keys(initialState)

function CarForm({ onSubmit, isLoading }) {
  const [form, setForm] = useState(initialState)
  const [errors, setErrors] = useState({})

  const availableModels = form.brand ? BRAND_MODELS[form.brand] : []

  // True only once every one of the 12 fields has a real, user-entered
  // value — never filled in automatically or defaulted.
  const isComplete = REQUIRED_FIELDS.every(
    (key) => form[key] !== '' && form[key] !== null && form[key] !== undefined,
  )

  function updateField(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      // Reset the model whenever the brand changes, so an invalid
      // brand/model pair can never be submitted.
      if (field === 'brand') {
        next.model = ''
      }
      return next
    })
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function validate() {
    const nextErrors = {}
    REQUIRED_FIELDS.forEach((key) => {
      if (form[key] === '' || form[key] === null || form[key] === undefined) {
        nextErrors[key] = 'Required'
      }
    })
    if (form.year && (Number(form.year) < 1990 || Number(form.year) > YEARS[0])) {
      nextErrors.year = 'Enter a valid year'
    }
    if (form.mileage_km && Number(form.mileage_km) < 0) {
      nextErrors.mileage_km = 'Must be 0 or more'
    }
    if (form.engine_size_cc && Number(form.engine_size_cc) <= 0) {
      nextErrors.engine_size_cc = 'Must be greater than 0'
    }
    if (form.owner_count && Number(form.owner_count) < 0) {
      nextErrors.owner_count = 'Must be 0 or more'
    }
    if (form.features_count && Number(form.features_count) < 0) {
      nextErrors.features_count = 'Must be 0 or more'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    // Belt-and-braces: the button is already disabled until every field
    // is filled, but never predict on an incomplete or invalid form.
    if (!isComplete || !validate()) return

    onSubmit({
      brand: form.brand,
      model: form.model,
      year: Number(form.year),
      mileage_km: Number(form.mileage_km),
      engine_size_cc: Number(form.engine_size_cc),
      fuel_type: form.fuel_type,
      transmission: form.transmission,
      owner_count: Number(form.owner_count),
      condition: form.condition,
      service_history: form.service_history,
      accident_history: form.accident_history,
      features_count: Number(form.features_count),
    })
  }

  return (
    <form className="car-form" onSubmit={handleSubmit} noValidate>
      <FormSection icon={<CarIcon />} title="Vehicle">
        <Field label="Brand" error={errors.brand}>
          <select value={form.brand} onChange={(e) => updateField('brand', e.target.value)}>
            <option value="">Select brand</option>
            {BRANDS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </Field>

        <Field label="Model" error={errors.model}>
          <select
            value={form.model}
            onChange={(e) => updateField('model', e.target.value)}
            disabled={!form.brand}
          >
            <option value="">{form.brand ? 'Select model' : 'Select a brand first'}</option>
            {availableModels.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </Field>

        <Field label="Year" error={errors.year}>
          <select value={form.year} onChange={(e) => updateField('year', e.target.value)}>
            <option value="">Select year</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </Field>

        <Field label="Engine size (cc)" error={errors.engine_size_cc}>
          <input
            type="number"
            min="0"
            placeholder="e.g. 1500"
            value={form.engine_size_cc}
            onChange={(e) => updateField('engine_size_cc', e.target.value)}
          />
        </Field>

        <Field label="Fuel type" error={errors.fuel_type}>
          <select value={form.fuel_type} onChange={(e) => updateField('fuel_type', e.target.value)}>
            <option value="">Select fuel type</option>
            {FUEL_TYPES.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </Field>

        <Field label="Transmission" error={errors.transmission}>
          <select
            value={form.transmission}
            onChange={(e) => updateField('transmission', e.target.value)}
          >
            <option value="">Select transmission</option>
            {TRANSMISSIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>
      </FormSection>

      <FormSection icon={<GaugeIcon />} title="Usage">
        <Field label="Mileage (km)" error={errors.mileage_km}>
          <input
            type="number"
            min="0"
            placeholder="e.g. 60000"
            value={form.mileage_km}
            onChange={(e) => updateField('mileage_km', e.target.value)}
          />
        </Field>

        <Field label="Previous owners" error={errors.owner_count}>
          <input
            type="number"
            min="0"
            placeholder="e.g. 1"
            value={form.owner_count}
            onChange={(e) => updateField('owner_count', e.target.value)}
          />
        </Field>

        <Field label="Features count" error={errors.features_count}>
          <input
            type="number"
            min="0"
            placeholder="e.g. 8"
            value={form.features_count}
            onChange={(e) => updateField('features_count', e.target.value)}
          />
        </Field>
      </FormSection>

      <FormSection icon={<ShieldIcon />} title="Vehicle History">
        <Field label="Vehicle condition" error={errors.condition}>
          <select value={form.condition} onChange={(e) => updateField('condition', e.target.value)}>
            <option value="">Select condition</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>

        <Field label="Service history" error={errors.service_history}>
          <select
            value={form.service_history}
            onChange={(e) => updateField('service_history', e.target.value)}
          >
            <option value="">Select</option>
            {SERVICE_HISTORY.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>

        <Field label="Accident history" error={errors.accident_history}>
          <select
            value={form.accident_history}
            onChange={(e) => updateField('accident_history', e.target.value)}
          >
            <option value="">Select</option>
            {ACCIDENT_HISTORY.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </Field>
      </FormSection>

      <button type="submit" className="predict-btn" disabled={isLoading || !isComplete}>
        {isLoading ? 'Estimating…' : 'Predict price'}
      </button>
      {!isComplete && (
        <p className="form-incomplete-note">Please complete all vehicle details.</p>
      )}
    </form>
  )
}

function FormSection({ icon, title, children }) {
  return (
    <fieldset className="form-section-group">
      <legend className="form-section-heading">
        <span className="form-section-icon">{icon}</span>
        {title}
      </legend>
      <div className="form-grid">{children}</div>
    </fieldset>
  )
}

function Field({ label, error, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {error && <span className="field-error">{error}</span>}
    </label>
  )
}

function CarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3.5 15.5l1.4-5.1A2.5 2.5 0 0 1 7.3 8.5h9.4a2.5 2.5 0 0 1 2.4 1.9l1.4 5.1" />
      <rect x="2.5" y="15.5" width="19" height="4.5" rx="1.5" />
      <circle cx="7" cy="20" r="1.3" />
      <circle cx="17" cy="20" r="1.3" />
    </svg>
  )
}

function GaugeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 15.5a8 8 0 1 1 16 0" />
      <path d="M12 15.5l4-4.2" />
      <circle cx="12" cy="15.5" r="1.1" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3.5l7 2.6v5.4c0 4.3-2.9 7.8-7 9-4.1-1.2-7-4.7-7-9V6.1l7-2.6z" />
      <path d="M9 12l2 2 4-4.2" />
    </svg>
  )
}

export default CarForm
