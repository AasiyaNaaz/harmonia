import { useState } from 'react'
import InstrumentPopup from '../InstrumentPopup'
import { Button } from '@/components/ui/button'
import pianoImg from '@assets/generated_images/Piano_instrument_photo_2822d5fc.png'

export default function InstrumentPopupExample() {
  const [isOpen, setIsOpen] = useState(false)

  const instrument = {
    name: "Piano",
    image: pianoImg,
    tutorial: [
      "Start with proper hand position on the keys",
      "Learn basic chord progressions (C, G, Am, F)",
      "Practice rhythm patterns with both hands",
      "Combine melody and harmony"
    ],
    audioSample: "piano-sample"
  }

  return (
    <div className="p-8">
      <Button onClick={() => setIsOpen(true)} data-testid="button-open-popup">
        Open Instrument Popup
      </Button>
      {isOpen && (
        <InstrumentPopup
          instrument={instrument}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
