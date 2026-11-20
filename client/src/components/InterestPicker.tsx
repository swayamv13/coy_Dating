interface InterestPickerProps {
  interests: string[]
  selected: string[]
  onChange: (interests: string[]) => void
}

function InterestPicker({ interests, selected, onChange }: InterestPickerProps) {
  const toggleInterest = (interest: string) => {
    if (selected.includes(interest)) {
      onChange(selected.filter((item) => item !== interest))
    } else if (selected.length < 12) {
      onChange([...selected, interest])
    }
  }

  return (
    <div className="interest-picker" role="group" aria-label="Profile interests">
      {interests.map((interest) => {
        const isSelected = selected.includes(interest)
        return (
          <button
            className={`interest-chip${isSelected ? ' interest-chip-selected' : ''}`}
            type="button"
            aria-pressed={isSelected}
            key={interest}
            onClick={() => toggleInterest(interest)}
          >
            {interest}
          </button>
        )
      })}
    </div>
  )
}

export default InterestPicker
