const THEME_DICT = {
    snow: ['snow','frost','blizzard','winter','ice','frozen','cold','freeze','flake','glacier','arctic','sleet'],
    fire: ['fire','flame','blaze','inferno','ember','scorch','burn','torch','heat','wildfire','smolder','ignite'],
    storm: ['storm','thunder','lightning','tempest','gale','hurricane','tornado','howl','wind','squall','downpour'],
    night: ['night','dark','darkness','shadow','moon','stars','midnight','dusk','twilight','moonlit','nocturnal'],
    calm: ['calm','peace','peaceful','gentle','serene','quiet','rest','soft','breeze','meadow','tranquil','bloom'],
    conflict: ['battle','fight','war','sword','clash','struck','attack','wound','blood','enemy','combat','rage'],
    magic: ['magic','spell','enchant','wizard','witch','potion','crystal','mystical','charm','rune','sorcery','arcane'],
    ocean: ['ocean','sea','wave','ship','sail','tide','shore','nautical','voyage','depth','current','island'],
    forest: ['forest','tree','wood','leaf','branch','roots','canopy','fern','moss','bark','thicket','grove'],
    celestial: ['star','galaxy','cosmos','space','nebula','planet','orbit','comet','void','universe','infinite'],
}

export function analyzeTheme(text) {
    if (!text) return 'calm'
    const lower = text.toLowerCase()
    const scores = {}
        for (const [theme, words] of Object.entries(THEME_DICT)) {
              scores[theme] = words.reduce((n, w) => {
                      const matches = lower.match(new RegExp('\\b' + w, 'gi'))
                      return n + (matches ? matches.length : 0)
              }, 0)
        }
    const best = Object.entries(scores).sort((a, b) => b[1] - a[1])
    return best[0][1] > 0 ? best[0][0] : 'calm'
}

export { THEME_DICT }
