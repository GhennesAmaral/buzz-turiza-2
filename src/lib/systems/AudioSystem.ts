import { Howl, Howler } from 'howler'

interface Sound {
  id: string
  howl: Howl
  volume: number
  loop: boolean
}

interface AudioConfig {
  masterVolume: number
  musicVolume: number
  sfxVolume: number
  muted: boolean
}

class AudioSystem {
  private sounds: Map<string, Sound> = new Map()
  private config: AudioConfig = {
    masterVolume: 0.8,
    musicVolume: 0.7,
    sfxVolume: 0.8,
    muted: false
  }
  private currentMusic: string | null = null

  constructor() {
    // Set global volume
    Howler.volume(this.config.masterVolume)
  }

  // Load a sound file
  loadSound(id: string, src: string | string[], options: {
    volume?: number
    loop?: boolean
    sprite?: { [key: string]: [number, number] }
    onload?: () => void
    onerror?: (error: any) => void
  } = {}) {
    const howl = new Howl({
      src,
      volume: options.volume ?? 1.0,
      loop: options.loop ?? false,
      sprite: options.sprite,
      onload: options.onload,
      onerror: options.onerror,
      preload: true
    })

    const sound: Sound = {
      id,
      howl,
      volume: options.volume ?? 1.0,
      loop: options.loop ?? false
    }

    this.sounds.set(id, sound)
    return sound
  }

  // Play a sound
  playSound(id: string, spriteId?: string): number | null {
    const sound = this.sounds.get(id)
    if (!sound || this.config.muted) return null

    const playId = sound.howl.play(spriteId)
    
    // Apply SFX volume
    sound.howl.volume(sound.volume * this.config.sfxVolume, playId)
    
    return playId
  }

  // Play background music
  playMusic(id: string, fadeIn: boolean = true): void {
    if (this.currentMusic) {
      this.stopMusic(true)
    }

    const sound = this.sounds.get(id)
    if (!sound || this.config.muted) return

    this.currentMusic = id
    const playId = sound.howl.play()
    
    if (fadeIn) {
      sound.howl.volume(0, playId)
      sound.howl.fade(0, sound.volume * this.config.musicVolume, 1000, playId)
    } else {
      sound.howl.volume(sound.volume * this.config.musicVolume, playId)
    }
  }

  // Stop background music
  stopMusic(fadeOut: boolean = true): void {
    if (!this.currentMusic) return

    const sound = this.sounds.get(this.currentMusic)
    if (!sound) return

    if (fadeOut) {
      sound.howl.fade(sound.howl.volume(), 0, 1000)
      setTimeout(() => {
        sound.howl.stop()
      }, 1000)
    } else {
      sound.howl.stop()
    }

    this.currentMusic = null
  }

  // Stop a specific sound
  stopSound(id: string, playId?: number): void {
    const sound = this.sounds.get(id)
    if (!sound) return

    if (playId !== undefined) {
      sound.howl.stop(playId)
    } else {
      sound.howl.stop()
    }
  }

  // Pause a sound
  pauseSound(id: string, playId?: number): void {
    const sound = this.sounds.get(id)
    if (!sound) return

    if (playId !== undefined) {
      sound.howl.pause(playId)
    } else {
      sound.howl.pause()
    }
  }

  // Resume a sound
  resumeSound(id: string, playId?: number): void {
    const sound = this.sounds.get(id)
    if (!sound) return

    if (playId !== undefined) {
      sound.howl.play(playId)
    } else {
      sound.howl.play()
    }
  }

  // Set master volume
  setMasterVolume(volume: number): void {
    this.config.masterVolume = Math.max(0, Math.min(1, volume))
    Howler.volume(this.config.masterVolume)
  }

  // Set music volume
  setMusicVolume(volume: number): void {
    this.config.musicVolume = Math.max(0, Math.min(1, volume))
    
    if (this.currentMusic) {
      const sound = this.sounds.get(this.currentMusic)
      if (sound) {
        sound.howl.volume(sound.volume * this.config.musicVolume)
      }
    }
  }

  // Set SFX volume
  setSfxVolume(volume: number): void {
    this.config.sfxVolume = Math.max(0, Math.min(1, volume))
  }

  // Mute/unmute all audio
  setMuted(muted: boolean): void {
    this.config.muted = muted
    Howler.mute(muted)
  }

  // Get current config
  getConfig(): AudioConfig {
    return { ...this.config }
  }

  // Preload multiple sounds
  preloadSounds(soundConfigs: Array<{
    id: string
    src: string | string[]
    options?: any
  }>): Promise<void[]> {
    const promises = soundConfigs.map(config => {
      return new Promise<void>((resolve, reject) => {
        this.loadSound(config.id, config.src, {
          ...config.options,
          onload: () => resolve(),
          onerror: (error) => reject(error)
        })
      })
    })

    return Promise.all(promises)
  }

  // Clean up resources
  dispose(): void {
    this.sounds.forEach(sound => {
      sound.howl.unload()
    })
    this.sounds.clear()
    this.currentMusic = null
  }
}

// Create singleton instance
export const audioSystem = new AudioSystem()
export default AudioSystem
