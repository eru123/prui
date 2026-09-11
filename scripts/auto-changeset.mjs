#!/usr/bin/env node
/**
 * auto-changeset.mjs — generate a changeset from conventional commits since
 * the last prui@* tag when packages/prui changed. Commit types map to bumps:
 *   fix:/perf:/refactor: -> patch
 *   feat:               -> minor
 *   BREAKING CHANGE / ! -> major
 * Docs-only, chore, test, ci commits inside packages/prui still bump patch
 * (a docs change in the shipped package warrants a patch release).
 *
 * A manually authored file in .changeset/ always wins: if one exists, we
 * assume a human already described the release and skip generation.
 */
import { readdirSync, writeFileSync, existsSync } from "node:fs"
import { execSync } from "node:child_process"

const sh = (cmd) => execSync(cmd, { encoding: "utf8" }).trim()

// respect hand-written changesets
if (existsSync(".changeset")) {
  const human = readdirSync(".changeset").filter((f) => f.endsWith(".md") && f !== "README.md" && f !== "config.json")
  if (human.length > 0) {
    console.log(`auto-changeset: ${human.length} hand-written changeset(s) found — skipping generation`)
    process.exit(0)
  }
}

const lastTag = (() => {
  try {
    return sh("git describe --tags --abbrev=0 --match 'prui@*'")
  } catch {
    return null
  }
})()

const log = lastTag
  ? sh(`git log ${lastTag}..HEAD --format=%H%x1f%s%x1f%b -- packages/prui`)
  : sh("git log -20 --format=%H%x1f%s%x1f%b -- packages/prui")

if (!log.trim()) {
  console.log("auto-changeset: no commits touching packages/prui — nothing to do")
  process.exit(0)
}

let bump = null
const lines = []

for (const entry of log.split("\n")) {
  if (!entry.trim()) continue
  const [, subject = "", body = ""] = entry.split("\x1f")
  const isBreaking = /!:/.test(subject) || /BREAKING CHANGE/i.test(body)
  const type = /^(feat|fix|perf|refactor|docs|chore|test|ci|style|build)(\(.+?\))?!?:/.exec(subject)

  if (isBreaking) bump = "major"
  else if (bump !== "major" && type?.[1] === "feat") bump = "minor"
  else if (!bump) bump = "patch"

  // readable entry: strip conventional prefix for the changelog line
  const clean = subject.replace(/^[a-z]+(\(.+?\))?!?:\s*/, "")
  if (clean && !lines.includes(clean)) lines.push(clean)
}

if (!bump) {
  console.log("auto-changeset: could not derive a bump — skipping")
  process.exit(0)
}

// cap the changelog at reasonable length
lines.splice(10)

const file = `.changeset/auto-${Date.now()}.md`
const front = `---\n"@skiddph/prui": ${bump}\n---\n\n`
const bodyText = lines.map((l) => `- ${l}`).join("\n")
writeFileSync(file, front + bodyText + "\n")
console.log(`auto-changeset: wrote ${file} (${bump})\n${bodyText}`)
