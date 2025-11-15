interface KeyState {
  pressed: boolean
  justPressed: boolean
  justReleased: boolean
}

interface MouseState {
  x: number
  y: number
  deltaX: number
  deltaY: number
  leftButton: boolean
  rightButton: boolean
  middleButton: boolean
  wheel: number
}

interface TouchState {
  touches: Array<{
    id: number
    x: number
    y: number
    deltaX: number
    deltaY: number
  }>
  pinchDistance: number
  pinchScale: number
}

type InputCallback = () => void
type KeyCallback = (key: string) => void
type MouseCallback = (mouse: MouseState) => void
type TouchCallback = (touch: TouchState) => void

class InputSystem {
  private keys: Map<string, KeyState> = new Map()
  private mouse: MouseState = {
    x: 0,
    y: 0,
    deltaX: 0,
    deltaY: 0,
    leftButton: false,
    rightButton: false,
    middleButton: false,
    wheel: 0
  }
  private touch: TouchState = {
    touches: [],
    pinchDistance: 0,
    pinchScale: 1
  }

  private keyDownCallbacks: Map<string, KeyCallback[]> = new Map()
  private keyUpCallbacks: Map<string, KeyCallback[]> = new Map()
  private mouseCallbacks: MouseCallback[] = []
  private touchCallbacks: TouchCallback[] = []

  private canvas: HTMLCanvasElement | null = null
  private enabled = true

  constructor() {
    this.setupEventListeners()
  }

  private setupEventListeners() {
    // Keyboard events
    window.addEventListener('keydown', this.handleKeyDown.bind(this))
    window.addEventListener('keyup', this.handleKeyUp.bind(this))

    // Mouse events
    window.addEventListener('mousemove', this.handleMouseMove.bind(this))
    window.addEventListener('mousedown', this.handleMouseDown.bind(this))
    window.addEventListener('mouseup', this.handleMouseUp.bind(this))
    window.addEventListener('wheel', this.handleWheel.bind(this))

    // Touch events
    window.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false })
    window.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
    window.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false })

    // Prevent context menu
    window.addEventListener('contextmenu', (e) => e.preventDefault())
  }

  setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  // Keyboard handling
  private handleKeyDown(event: KeyboardEvent) {
    if (!this.enabled) return

    const key = event.code
    let keyState = this.keys.get(key)
    
    if (!keyState) {
      keyState = { pressed: false, justPressed: false, justReleased: false }
      this.keys.set(key, keyState)
    }

    if (!keyState.pressed) {
      keyState.justPressed = true
      keyState.pressed = true

      // Call callbacks
      const callbacks = this.keyDownCallbacks.get(key)
      if (callbacks) {
        callbacks.forEach(callback => callback(key))
      }
    }

    // Prevent default for game keys
    if (this.isGameKey(key)) {
      event.preventDefault()
    }
  }

  private handleKeyUp(event: KeyboardEvent) {
    if (!this.enabled) return

    const key = event.code
    const keyState = this.keys.get(key)
    
    if (keyState && keyState.pressed) {
      keyState.pressed = false
      keyState.justReleased = true

      // Call callbacks
      const callbacks = this.keyUpCallbacks.get(key)
      if (callbacks) {
        callbacks.forEach(callback => callback(key))
      }
    }
  }

  private isGameKey(key: string): boolean {
    const gameKeys = [
      'KeyW', 'KeyA', 'KeyS', 'KeyD', // WASD
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', // Arrows
      'Space', 'ShiftLeft', 'ShiftRight', // Common game keys
      'ControlLeft', 'ControlRight',
      'Tab', 'Enter', 'Escape'
    ]
    return gameKeys.includes(key)
  }

  // Mouse handling
  private handleMouseMove(event: MouseEvent) {
    if (!this.enabled) return

    const rect = this.canvas?.getBoundingClientRect()
    const x = rect ? event.clientX - rect.left : event.clientX
    const y = rect ? event.clientY - rect.top : event.clientY

    this.mouse.deltaX = x - this.mouse.x
    this.mouse.deltaY = y - this.mouse.y
    this.mouse.x = x
    this.mouse.y = y

    this.mouseCallbacks.forEach(callback => callback(this.mouse))
  }

  private handleMouseDown(event: MouseEvent) {
    if (!this.enabled) return

    switch (event.button) {
      case 0: this.mouse.leftButton = true; break
      case 1: this.mouse.middleButton = true; break
      case 2: this.mouse.rightButton = true; break
    }

    this.mouseCallbacks.forEach(callback => callback(this.mouse))
  }

  private handleMouseUp(event: MouseEvent) {
    if (!this.enabled) return

    switch (event.button) {
      case 0: this.mouse.leftButton = false; break
      case 1: this.mouse.middleButton = false; break
      case 2: this.mouse.rightButton = false; break
    }

    this.mouseCallbacks.forEach(callback => callback(this.mouse))
  }

  private handleWheel(event: WheelEvent) {
    if (!this.enabled) return

    this.mouse.wheel = event.deltaY
    this.mouseCallbacks.forEach(callback => callback(this.mouse))
    
    // Reset wheel after frame
    setTimeout(() => {
      this.mouse.wheel = 0
    }, 16)
  }

  // Touch handling
  private handleTouchStart(event: TouchEvent) {
    if (!this.enabled) return

    event.preventDefault()
    this.updateTouches(event.touches)
    this.touchCallbacks.forEach(callback => callback(this.touch))
  }

  private handleTouchMove(event: TouchEvent) {
    if (!this.enabled) return

    event.preventDefault()
    this.updateTouches(event.touches)
    this.touchCallbacks.forEach(callback => callback(this.touch))
  }

  private handleTouchEnd(event: TouchEvent) {
    if (!this.enabled) return

    event.preventDefault()
    this.updateTouches(event.touches)
    this.touchCallbacks.forEach(callback => callback(this.touch))
  }

  private updateTouches(touchList: TouchList) {
    const rect = this.canvas?.getBoundingClientRect()
    
    this.touch.touches = Array.from(touchList).map(touch => {
      const x = rect ? touch.clientX - rect.left : touch.clientX
      const y = rect ? touch.clientY - rect.top : touch.clientY
      
      const existingTouch = this.touch.touches.find(t => t.id === touch.identifier)
      
      return {
        id: touch.identifier,
        x,
        y,
        deltaX: existingTouch ? x - existingTouch.x : 0,
        deltaY: existingTouch ? y - existingTouch.y : 0
      }
    })

    // Calculate pinch distance and scale
    if (this.touch.touches.length === 2) {
      const [touch1, touch2] = this.touch.touches
      const distance = Math.sqrt(
        Math.pow(touch2.x - touch1.x, 2) + Math.pow(touch2.y - touch1.y, 2)
      )
      
      if (this.touch.pinchDistance > 0) {
        this.touch.pinchScale = distance / this.touch.pinchDistance
      }
      this.touch.pinchDistance = distance
    } else {
      this.touch.pinchDistance = 0
      this.touch.pinchScale = 1
    }
  }

  // Public API
  isKeyPressed(key: string): boolean {
    const keyState = this.keys.get(key)
    return keyState ? keyState.pressed : false
  }

  isKeyJustPressed(key: string): boolean {
    const keyState = this.keys.get(key)
    return keyState ? keyState.justPressed : false
  }

  isKeyJustReleased(key: string): boolean {
    const keyState = this.keys.get(key)
    return keyState ? keyState.justReleased : false
  }

  getMousePosition(): { x: number, y: number } {
    return { x: this.mouse.x, y: this.mouse.y }
  }

  getMouseDelta(): { x: number, y: number } {
    return { x: this.mouse.deltaX, y: this.mouse.deltaY }
  }

  isMouseButtonPressed(button: 'left' | 'right' | 'middle'): boolean {
    switch (button) {
      case 'left': return this.mouse.leftButton
      case 'right': return this.mouse.rightButton
      case 'middle': return this.mouse.middleButton
      default: return false
    }
  }

  getMouseWheel(): number {
    return this.mouse.wheel
  }

  getTouches(): TouchState['touches'] {
    return this.touch.touches
  }

  getPinchScale(): number {
    return this.touch.pinchScale
  }

  // Event callbacks
  onKeyDown(key: string, callback: KeyCallback) {
    if (!this.keyDownCallbacks.has(key)) {
      this.keyDownCallbacks.set(key, [])
    }
    this.keyDownCallbacks.get(key)!.push(callback)
  }

  onKeyUp(key: string, callback: KeyCallback) {
    if (!this.keyUpCallbacks.has(key)) {
      this.keyUpCallbacks.set(key, [])
    }
    this.keyUpCallbacks.get(key)!.push(callback)
  }

  onMouse(callback: MouseCallback) {
    this.mouseCallbacks.push(callback)
  }

  onTouch(callback: TouchCallback) {
    this.touchCallbacks.push(callback)
  }

  // Update method - call this in your game loop
  update() {
    // Reset just pressed/released flags
    this.keys.forEach(keyState => {
      keyState.justPressed = false
      keyState.justReleased = false
    })

    // Reset mouse delta
    this.mouse.deltaX = 0
    this.mouse.deltaY = 0
  }

  // Cleanup
  dispose() {
    this.keys.clear()
    this.keyDownCallbacks.clear()
    this.keyUpCallbacks.clear()
    this.mouseCallbacks.length = 0
    this.touchCallbacks.length = 0
  }
}

// Create singleton instance
export const inputSystem = new InputSystem()
export default InputSystem
