export function truncHourFromDate(now: Date) {
  const minutes = now.getMinutes()

  if (minutes >= 30) {
    // TODO: checar que el redondeo aplique en la fecha (si se redondea a las 12 am)
    return new Date(now.setHours(now.getHours() + 1))
  }
  return new Date(now.setMinutes(0, 0, 0))
}
