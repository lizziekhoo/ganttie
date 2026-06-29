#!/usr/bin/env bash
# Combined status line: context bar + Nimbus penguin buddy
# Shows context-window usage on the left, then the buddy on the right

input=$(cat)

# ─── Part 1: Context usage bar ─────────────────────────────────────────────────
# Claude Code's statusLine JSON does NOT send a usage percentage. It sends the
# transcript_path; we read the most recent assistant message's token usage from
# it and divide by the model's context-window limit to derive the percentage.
raw_dir=$(echo "$input" | jq -r '.workspace.current_dir // .cwd // empty')
dir="${raw_dir/#$HOME/\~}"
branch=$(git -C "$raw_dir" --no-optional-locks rev-parse --abbrev-ref HEAD 2>/dev/null || true)
model=$(echo "$input" | jq -r '.model.display_name // "unknown"')
transcript=$(echo "$input" | jq -r '.transcript_path // empty')

# Context-window limit: default 200k; auto-bump to 1M for "[1m]" models.
limit=200000
case "$model" in
  *1m*|*1M*) limit=1000000 ;;
esac

# Sum the most recent usage record's input + cache tokens = current prompt size.
used_tokens=0
if [ -n "$transcript" ] && [ -f "$transcript" ]; then
  last_usage=$(grep '"usage"' "$transcript" 2>/dev/null | tail -1 \
    | jq -r 'select(.message.usage) | .message.usage |
             ((.input_tokens//0)+(.cache_creation_input_tokens//0)+(.cache_read_input_tokens//0))' 2>/dev/null)
  [ -n "$last_usage" ] && used_tokens=$last_usage
fi

if [ "$limit" -gt 0 ]; then
  pct=$(( used_tokens * 100 / limit ))
  [ "$pct" -gt 100 ] && pct=100
else
  pct=0
fi

filled=$(( pct * 20 / 100 ))
bar=""
for i in $(seq 1 20); do
  if [ "$i" -le "$filled" ]; then bar="${bar}█"; else bar="${bar}░"; fi
done

# Color the bar based on usage
if [ "$pct" -lt 50 ]; then
  bar_color="\033[32m"  # Green
elif [ "$pct" -lt 80 ]; then
  bar_color="\033[33m"  # Yellow
else
  bar_color="\033[31m"  # Red
fi

# Build segment list, joining with dim separators.
sep="\033[2m | \033[0m"
segments="\033[01;34m${dir}\033[00m"
[ -n "$branch" ] && segments="${segments}${sep}\033[01;33m${branch}\033[0m"
segments="${segments}${sep}${bar_color}${bar}\033[0m ${pct}%"
segments="${segments}${sep}\033[2m${model}\033[0m"
context_line="$segments"

# ─── Part 2: Nimbus penguin buddy (right side) ───────────────────────────────────
# Call the buddy-status.sh script (it reads from its own state files, not stdin)
BUDDY_SCRIPT="/Users/elizabethkhoo/buddy/claude-buddy/statusline/buddy-status.sh"
if [ -f "$BUDDY_SCRIPT" ]; then
  buddy_output=$("$BUDDY_SCRIPT" </dev/null 2>/dev/null)
else
  buddy_output=""
fi

# ─── Part 3: Merge both outputs ────────────────────────────────────────────────────
if [ -n "$context_line" ] && [ -n "$buddy_output" ]; then
  # Print context line first, then buddy output
  printf '%b\n' "$context_line"
  printf '%s\n' "$buddy_output"
elif [ -n "$buddy_output" ]; then
  # Only buddy output (no context data available)
  printf '%s\n' "$buddy_output"
elif [ -n "$context_line" ]; then
  # Only context line (buddy not available)
  printf '%b\n' "$context_line"
fi
