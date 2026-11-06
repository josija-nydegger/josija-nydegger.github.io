---
title: "From Laptop to Phone – No Cable, No Wi-Fi, No Login"
description: How my project QR-tool sends text to a phone through a sequence of QR codes, and how it got faster, safer and more capable with every version.
ref: qr-tool
image: /images/blog/qr-tool-sender.jpg
tags: [QR-tool, project, data transfer, security, AI]
---

I'm sitting in a lecture with my notes on my laptop, and I'd like to have them on my phone for the train ride home. The usual options all need something I don't really want for that: a cable, a shared network, or a login to an email or cloud service.

So I built **QR-tool**. The laptop shows a rapid sequence of QR codes, the phone films them with its camera and puts the text back together. No app, no account, and no internet connection between the two devices.

![The sender shows four QR codes at once, changing 15 times per second](/images/blog/qr-tool-sender.jpg)

## What the tool can do

QR-tool consists of two web pages. The **sender** is a single file that I open on the laptop with a double-click. It even works on a computer with no internet access at all. The **receiver** runs in the phone's browser.

- **Text and documents:** Plain text or formatted notes with headings, tables and math formulas.
- **Encryption:** Protected with a passphrase. Anyone filming the screen only sees scrambled data.
- **Business cards:** A contact as a QR code that any regular phone camera can save directly.
- **Further use:** Copy, share, or save as a TXT, Markdown, CSV or PDF file.
- **Statistics:** After each transfer, the phone shows how long it took and how fast it was.

## How a transfer works

1. On the laptop, I open the sender, paste my notes and add a passphrase if needed.
2. I start the stream, ideally in cinema mode, which shows the codes full screen.
3. On my phone, I open the receiver and point the camera at the screen. A grid of tiles turns green as the data arrives.
4. A few seconds later, the notes appear on my phone, formatted and ready to save. For an encrypted stream, I enter the passphrase first.

<img src="/images/blog/qr-tool-streamer.png" alt="The sender on the laptop: lecture notes in Markdown, the passphrase “Brücke Beton Statik Kaffee”, four codes per frame at 15 frames per second" width="480" loading="lazy">

<img src="/images/blog/qr-tool-reader.png" alt="The receiver on the phone after entering the passphrase: statistics, the same notes formatted with a formula and a table, export buttons" width="320" loading="lazy">

## How fast is it?

Here's one example: I sent about **30,000&nbsp;words**, roughly 100 book pages. The text was 217&nbsp;KB and was compressed to 84&nbsp;KB before sending, 61% smaller. With four codes per frame and 15&nbsp;frames per second, everything was on my phone after **3.2&nbsp;seconds**. That's an average of 25.9&nbsp;KB per second, with a peak of 31.3&nbsp;KB/s.

Interestingly, more frames per second don't automatically make it faster. The same test took longer at both 10 and 20&nbsp;frames per second. At 20, the phone camera probably can't keep up and more frames get lost. For these settings, 15&nbsp;frames per second is the sweet spot.

So how far can you push it? For my largest test so far, I sent the entire novel **Moby Dick**, which is available for free as a text file from [Project Gutenberg](https://www.gutenberg.org/ebooks/2701): 215,845&nbsp;words or 1.2&nbsp;MB of text, compressed to 493&nbsp;KB. **Just over a minute** later, the whole book was on my phone.

## What makes it special

Sending data through QR codes isn't a new idea. A post on X inspired me, and I wanted to see how far I could push it. Three things make QR-tool special in my view:

**There's no way back.** Data only flows from the screen to the camera. The phone can't send anything back to the laptop, and there's no network along the way that anyone could tap into.

**Missed frames don't matter.** When you hold a phone in your hand, it shakes. Some frames are blurry or get skipped. In earlier versions, that meant parts 17 and 42 were missing at the end, and I had to resend them manually. Today the sender packs the data with so-called **fountain codes**: after a first pass, every new frame is a mix of several parts. The phone doesn't need to catch specific frames, just *enough* of them. Once enough have arrived, the rest can be calculated, a bit like a sudoku you can solve with any set of clues, as long as there are enough. The principle comes from telecommunications, where it's used whenever the receiver can't ask for anything to be sent again.

**It just runs in the browser.** No installation, no account, no server that stores your data.

## From version to version

QR-tool grew in three stages:

- **First version (May 2026), about 0.7&nbsp;KB/s:** the basic idea, formatted notes with formulas and a first form of encryption.
- **The day after, about 3&nbsp;KB/s:** a much better scanner, business cards and PDF export.
- **Overhaul (October 2026), 25.9&nbsp;KB/s measured:** rebuilt security, fountain codes, four codes per frame, exports and statistics.

The first version showed five codes per second with 150 characters each. In my test, today's version is about **35 times faster**. The biggest leap didn't come from a single trick but from the combination: denser codes, better compression, several codes at once, and no more hunting for missing frames.

## Built with AI, and what I learned

I programmed QR-tool with the help of AI. On the first day, that produced 37 versions in about six hours: I described what I wanted and had a working solution shortly after. Without AI, I would never have managed that in the time.

The downside showed up later. In October, I had an AI review the code on purpose, not with the instruction "build this for me" but "find the flaws". The result was sobering:

- A crafted QR code could have run foreign code on the receiver page.
- The encryption, described as "military-grade", was much weaker than claimed.
- A filter meant to prevent crashes silently deleted characters like €, emoji or Greek letters.
- The sender, supposed to work "without internet", actually loaded its building blocks from the internet.

All of this has since been fixed. My takeaway: AI is a huge accelerator, but the responsibility stays with me. Features appear in minutes. Whether a security promise holds still has to be checked line by line, and AI turns out to be surprisingly good at that when you explicitly ask it to.

## Try it

You can open the receiver directly on your phone: [QR-Reader](https://josija-nydegger.ch/QR-tool/QR-Reader.html). Open the sender on your laptop: [QR-Streamer](https://josija-nydegger.ch/QR-tool/QR-Streamer.html). You can also save the file and open it offline with a double-click. All the code is on [GitHub](https://github.com/josija-nydegger/QR-tool).

Next, I want to make the receiver even faster and add support for whole files, not just text.
