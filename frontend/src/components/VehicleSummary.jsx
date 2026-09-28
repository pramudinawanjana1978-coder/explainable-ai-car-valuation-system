/**
 * Compact strip summarizing the vehicle just submitted, built entirely
 * from the actual form values passed in — nothing hardcoded or fetched.
 */
function VehicleSummary({ vehicleDetails }) {
  if (!vehicleDetails) return null

  const parts = [
    vehicleDetails.brand,
    vehicleDetails.model,
    vehicleDetails.year,
    vehicleDetails.transmission,
    vehicleDetails.condition,
  ].filter((part) => part !== undefined && part !== null && part !== '')

  if (parts.length === 0) return null

  return (
    <div className="vehicle-summary">
      {parts.map((part, idx) => (
        <span key={idx} className="vehicle-summary-part">
          {String(part)}
          {idx < parts.length - 1 && <span className="vehicle-summary-dot">•</span>}
        </span>
      ))}
    </div>
  )
}

export default VehicleSummary
