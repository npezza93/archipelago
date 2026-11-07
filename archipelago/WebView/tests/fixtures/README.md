`JetBrainsMono-Regular.ttf` is the unmodified JetBrains Mono 2.304 font from:

https://github.com/JetBrains/JetBrainsMono/blob/v2.304/fonts/ttf/JetBrainsMono-Regular.ttf

It is used only by browser tests. Its SIL Open Font License is included as
`OFL.JetBrainsMono.txt`. The ligature test reproduces native font delivery through
the Strada bridge and compares canvas pixels with shaped and unshaped glyphs. Ligatures are always enabled, including for legacy profiles.
