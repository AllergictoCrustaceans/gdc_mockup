import React, { useState } from 'react'

const QRCodeScanner = ({ scanCode }: { scanCode: (code: string) => void }) => {
    const [codeInput, setCodeInput] = useState<string>("");
    return (
        <div>
            <input
                placeholder="Paste ticket code or click 'Scan'"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
            />
            <button onClick={() => scanCode(codeInput)}>Scan</button>
        </div>
    )
}

export default QRCodeScanner