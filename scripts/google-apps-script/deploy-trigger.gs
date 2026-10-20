/**
 * Rebuilds the CV site whenever the Google Sheet changes.
 *
 * Edits are debounced: every edit only records a timestamp, and a time-driven trigger
 * sends a single `repository_dispatch` to GitHub once nobody has edited for a few minutes.
 * This replaces the former twice-daily cron build (and its keepalive commits).
 *
 * Setup (once, see README → "Automatic deploys from the sheet"):
 *   1. Sheet → Extensions → Apps Script, paste this file.
 *   2. Project Settings → Script properties: GITHUB_TOKEN = fine-grained token
 *      (only this repository, permission "Contents: Read and write").
 *   3. Run `setupTriggers` once and grant the requested permissions.
 */

const REPOSITORY = "sebastian-grab-smiit/sebastian-grab-smiit.github.io"
const QUIET_PERIOD_MINUTES = 3
const LAST_EDIT_KEY = "LAST_EDIT_AT"

/** Installable "on edit" / "on change" trigger: remember that the sheet changed. */
function recordEdit() {
  PropertiesService.getScriptProperties().setProperty(LAST_EDIT_KEY, String(Date.now()))
}

/** Time-driven trigger: deploy once the sheet has been quiet for QUIET_PERIOD_MINUTES. */
function deployIfChanged() {
  const props = PropertiesService.getScriptProperties()
  const lastEdit = Number(props.getProperty(LAST_EDIT_KEY) || 0)
  if (!lastEdit) return
  if (Date.now() - lastEdit < QUIET_PERIOD_MINUTES * 60 * 1000) return

  triggerDeploy_()
  props.deleteProperty(LAST_EDIT_KEY)
}

/** Menu action for an immediate deploy. */
function deployNow() {
  triggerDeploy_()
  PropertiesService.getScriptProperties().deleteProperty(LAST_EDIT_KEY)
  SpreadsheetApp.getActive().toast("Deployment started – the site updates in a few minutes.", "CV")
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu("CV").addItem("Publish now", "deployNow").addToUi()
}

/** Run once from the Apps Script editor. Safe to re-run; replaces existing triggers. */
function setupTriggers() {
  ScriptApp.getProjectTriggers().forEach((t) => ScriptApp.deleteTrigger(t))
  const sheet = SpreadsheetApp.getActive()
  ScriptApp.newTrigger("recordEdit").forSpreadsheet(sheet).onEdit().create()
  ScriptApp.newTrigger("recordEdit").forSpreadsheet(sheet).onChange().create()
  ScriptApp.newTrigger("deployIfChanged").timeBased().everyMinutes(5).create()
}

function triggerDeploy_() {
  const token = PropertiesService.getScriptProperties().getProperty("GITHUB_TOKEN")
  if (!token) throw new Error("Script property GITHUB_TOKEN is not set")

  const response = UrlFetchApp.fetch(`https://api.github.com/repos/${REPOSITORY}/dispatches`, {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    payload: JSON.stringify({ event_type: "sheet-updated" }),
    muteHttpExceptions: true,
  })
  if (response.getResponseCode() !== 204) {
    throw new Error(
      `GitHub dispatch failed (${response.getResponseCode()}): ${response.getContentText()}`,
    )
  }
}
