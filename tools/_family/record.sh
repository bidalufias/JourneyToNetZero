#!/bin/bash
# Every 15 seconds, note what the TV masthead says. Stops after 50 minutes.
LOG=/tmp/claude-0/-home-user-JourneyToNetZero/d7eef4b3-0dfc-5a56-9820-99faa40be251/scratchpad/family/timeline.log
cd /home/user/JourneyToNetZero
for i in $(seq 1 200); do
  echo "=== $(date +%H:%M:%S)" >> "$LOG"
  node tools/_family/phone.mjs tv look 2>/dev/null | sed -n '3,12p' >> "$LOG"
  sleep 15
done
