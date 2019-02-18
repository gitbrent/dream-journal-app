const APP_LOGO_BASE64 = "data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iNTEycHgiIGhlaWdodD0iNTEycHgiPgo8cmVjdCB4PSIyNTEuNzQ2IiB5PSI1MS4yIiBzdHlsZT0iZmlsbDojMDA3MUJDOyIgd2lkdGg9IjI1NiIgaGVpZ2h0PSI0MTguMTMzIi8+CjxwYXRoIHN0eWxlPSJmaWxsOiNFNkU2RTY7IiBkPSJNNDQ4LjAxMyw0MzUuMkgyNTEuNzQ2bDAsMHYtMzg0bDAsMGgyMjEuODY3bDAsMHYzNTguNEM0NzMuNjEzLDQyMy43NCw0NjIuMTUyLDQzNS4yLDQ0OC4wMTMsNDM1LjJ6ICAiLz4KPHBhdGggc3R5bGU9ImZpbGw6IzI5QUJFMjsiIGQ9Ik00NzMuNjEzLDQwOS42TDQ3My42MTMsNDA5LjZjMC0xNC4xNC0xMS40Ni0yNS42LTI1LjYtMjUuNmgtMjUuNlY4LjUzM2gyNS42ICBjMTQuMTQsMCwyNS42LDExLjQ2LDI1LjYsMjUuNlY0MDkuNnoiLz4KPHBhdGggc3R5bGU9ImZpbGw6I0YyQzA5QTsiIGQ9Ik0yNTEuNzQ2LDQ2MC44YzAsMjMuNTYxLTE5LjEwNiw0Mi42NjctNDIuNjY3LDQyLjY2N3MtNDIuNjY3LTE5LjEwNi00Mi42NjctNDIuNjY3di0wLjYwNiAgYy0zMi42ODMsNC42OTMtNjIuOTY3LTE3Ljk5Ny02Ny42NjEtNTAuNjc5Yy0wLjQwMS0yLjc5OS0wLjYwNi01LjYyMy0wLjYwNi04LjQ0OGMtMzIuOTktMC4wMDktNTkuNzI1LTI2Ljc2MS01OS43MTYtNTkuNzUgIGMwLTEzLjc3Myw0Ljc2Mi0yNy4xMTksMTMuNDc0LTM3Ljc3N2MtMzAuOTY3LTExLjM4My00Ni44MzktNDUuNzA1LTM1LjQ2NS03Ni42NzJjNC45NTgtMTMuNSwxNC42MjYtMjQuNzU1LDI3LjIyMS0zMS43MDEgIGMtMTMuNTM0LTMwLjA4OS0wLjExMS02NS40NTEsMjkuOTc4LTc4Ljk3NmM3LjcwNi0zLjQ2NSwxNi4wNi01LjI1NywyNC41MDgtNS4yNTdjMi44MjUsMCw1LjY0OSwwLjE5Niw4LjQ0OCwwLjU4OWwwLjA4NS0wLjU4OSAgYzAtMzIuOTksMjYuNzQzLTU5LjczMyw1OS43MzMtNTkuNzMzYzAtMjMuNTYxLDE5LjEwNi00Mi42NjcsNDIuNjY3LTQyLjY2N3M0Mi42NjcsMTkuMTA2LDQyLjY2Nyw0Mi42NjciLz4KPHBhdGggc3R5bGU9ImZpbGw6I0U5OTM3QzsiIGQ9Ik0yMDkuMDc5LDBjLTI1LjE0OCwwLjAzNC00Ni41NDksMTguMzIxLTUwLjUsNDMuMTUzYy0zMS4yMDYsMy42NTItNTUuOTAyLDI4LjExNy01OS44NDQsNTkuMjkgIGMtMC4xOTYsMC0wLjM5My0wLjA0My0wLjU4OS0wLjA0M2MtMzcuNy0wLjAwOS02OC4yNzUsMzAuNTQ5LTY4LjI4NCw2OC4yNWMwLDcuMTY4LDEuMTI2LDE0LjMwMiwzLjM0NSwyMS4xMiAgQzIuNDEsMjEzLjQzNi00Ljk4OCwyNTUuOTU3LDE2LjY3OCwyODYuNzU0YzUuODg4LDguMzYzLDEzLjU3NywxNS4zLDIyLjUwMiwyMC4yODRjLTE5LjAwNCwzMi40NDQtOC4xMDcsNzQuMTU1LDI0LjMzNyw5My4xNjcgIGM4LjE1OCw0Ljc3OSwxNy4yMTIsNy43OTksMjYuNjA3LDguODgzYzQuMDk2LDM0LjMzLDMzLjE4Niw2MC4xOTQsNjcuNzU1LDYwLjI0NWMwLjI1NiwwLDAuNTEyLTAuMDUxLDAuNzU5LTAuMDUxICBjNC44NDcsMjcuODYxLDMxLjM2OSw0Ni41MDcsNTkuMjIxLDQxLjY2YzI0LjQwNS00LjI1LDQyLjI3NC0yNS4zNyw0Mi40MTktNTAuMTQyVjUxLjJDMjYwLjI1NCwyMi45MzgsMjM3LjM1LDAuMDI2LDIwOS4wNzksMHogICBNMjA5LjA3OSw0OTQuOTMzYy0xOC44NSwwLTM0LjEzMy0xNS4yODMtMzQuMTMzLTM0LjEzM2MwLTEwLjc0Myw1LjA2LTIwLjg2NCwxMy42NTMtMjcuMzA3bC0xMC4yNC0xMy42NTMgIGMtMTAuNDk2LDcuODQyLTE3LjU0NSwxOS40MzktMTkuNjc4LDMyLjM2N2MtMC4yNjUsMC0wLjUyOSwwLjA2LTAuNzk0LDAuMDZjLTI1LjIxNi0wLjAyNi00Ni42Ni0xOC40MTUtNTAuNTM0LTQzLjMzMiAgYzMuNDktMC40NTIsNi45MzgtMS4xNzgsMTAuMzA4LTIuMTY3bC00Ljg4MS0xNi4zNThjLTI3LjEwMiw4LjA2NC01NS42MDMtNy4zNzMtNjMuNjY3LTM0LjQ4MyAgYy04LjA2NC0yNy4xMSw3LjM3My01NS42MTIsMzQuNDgzLTYzLjY2N2MxMi4xLTMuNjAxLDI1LjA5Ny0yLjYwMywzNi41MDYsMi43OTlsNy4zMjItMTUuNDExICBjLTI2LjEzOC0xMi40MDctNTcuMjU5LTYuOTcyLTc3LjY1MywxMy41NTFjLTI1LjMwMS0xMi41MTgtMzUuNjY5LTQzLjE3OS0yMy4xNTEtNjguNDhjOC42MzYtMTcuNDU5LDI2LjQ1My0yOC40OTMsNDUuOTM1LTI4LjQ1ICBWMTc5LjJjLTguMTY2LDAuMDE3LTE2LjI1NiwxLjUwMi0yMy44OTMsNC4zOTVjLTcuMjQ1LTI3LjIzLDguOTUxLTU1LjE2OCwzNi4xODEtNjIuNDEzYzQuMzQzLTEuMTUyLDguODE1LTEuNzMyLDEzLjMxMi0xLjcxNSAgYzAuMTc5LDAsMC4zNjcsMCwwLjU0NiwwYzIuNTA5LDIwLjUzMSwxNC4yNTEsMzguNzkzLDMxLjg4MSw0OS41OTZsOC45NjktMTQuNTA3Yy0yNC4wNjQtMTQuODQ4LTMxLjUzOS00Ni4zOTYtMTYuNjgzLTcwLjQ2ICBjNy44OTMtMTIuNzkxLDIxLjAxOC0yMS40NywzNS44NzQtMjMuNzMxYzIuMDM5LDExLjE4Nyw3Ljc0OCwyMS4zNzYsMTYuMjEzLDI4Ljk3MWwxMS4zOTItMTIuNzE1ICBjLTE0LjA1NC0xMi41NjEtMTUuMjc1LTM0LjEzMy0yLjcxNC00OC4xOTZjMTIuNTYxLTE0LjA1NCwzNC4xMzMtMTUuMjc1LDQ4LjE5Ni0yLjcxNGM3LjI1Myw2LjQ4NSwxMS40MDEsMTUuNzUzLDExLjM5MiwyNS40ODkgIHYxNjEuMzY1Yy0yNy44NzgtNC43NDUtNDYuNjM1LTMxLjE4MS00MS44OS01OS4wNTljMi41LTE0LjY5NCwxMS4yODEtMjcuNTcxLDI0LjA0Ny0zNS4yNjhsLTguODA2LTE0LjYwOSAgYy0yOS4yNjksMTcuNTc5LTQxLjAyOCw1NC4wOTMtMjcuNTIsODUuNDUzYy0yMy4yMTEsNS4zNzYtMzkuNjU0LDI2LjAyNy0zOS42OTcsNDkuODUyaDE3LjA2NyAgYzAuMDQzLTE4LjA4MiwxNC4yMDgtMzIuOTgxLDMyLjI2NS0zMy45NDZjMTEuMDc2LDEzLjcyMiwyNy4wNDIsMjIuNjEzLDQ0LjUzNSwyNC44MjN2OTQuNDU1aC0xNy4wNjcgIGMtMi44NTksMC4wMTctNS43MTcsMC4yNzMtOC41MzMsMC43Njh2LTAuNzY4Yy0wLjAyNi0yMy41NTItMTkuMTE1LTQyLjY0MS00Mi42NjctNDIuNjY3djE3LjA2N2MxNC4xNCwwLDI1LjYsMTEuNDYsMjUuNiwyNS42ICB2Ni45MjljLTE1LjgyMSw5LjEzMS0yNS41NzQsMjYuMDAxLTI1LjYsNDQuMjcxaDE3LjA2N2MwLTE4Ljg1LDE1LjI4My0zNC4xMzMsMzQuMTMzLTM0LjEzM2gxNy4wNjdWNDYwLjggIEMyNDMuMjEyLDQ3OS42NSwyMjcuOTI5LDQ5NC45MzMsMjA5LjA3OSw0OTQuOTMzeiIvPgo8Zz4KCTxyZWN0IHg9IjMwMi45NDYiIHk9Ijg1LjMzMyIgc3R5bGU9ImZpbGw6I0IzQjNCMzsiIHdpZHRoPSIxNy4wNjciIGhlaWdodD0iMTcuMDY3Ii8+Cgk8cmVjdCB4PSIzMzcuMDc5IiB5PSI4NS4zMzMiIHN0eWxlPSJmaWxsOiNCM0IzQjM7IiB3aWR0aD0iNTEuMiIgaGVpZ2h0PSIxNy4wNjciLz4KCTxyZWN0IHg9IjI4NS44NzkiIHk9IjExOS40NjciIHN0eWxlPSJmaWxsOiNCM0IzQjM7IiB3aWR0aD0iMTAyLjQiIGhlaWdodD0iMTcuMDY3Ii8+Cgk8cmVjdCB4PSIyODUuODc5IiB5PSIxNTMuNiIgc3R5bGU9ImZpbGw6I0IzQjNCMzsiIHdpZHRoPSIxMDIuNCIgaGVpZ2h0PSIxNy4wNjciLz4KCTxyZWN0IHg9IjI4NS44NzkiIHk9IjE4Ny43MzMiIHN0eWxlPSJmaWxsOiNCM0IzQjM7IiB3aWR0aD0iNjguMjY3IiBoZWlnaHQ9IjE3LjA2NyIvPgoJPHJlY3QgeD0iMzAyLjk0NiIgeT0iMjgxLjYiIHN0eWxlPSJmaWxsOiNCM0IzQjM7IiB3aWR0aD0iMTcuMDY3IiBoZWlnaHQ9IjE3LjA2NyIvPgoJPHJlY3QgeD0iMzM3LjA3OSIgeT0iMjgxLjYiIHN0eWxlPSJmaWxsOiNCM0IzQjM7IiB3aWR0aD0iNTEuMiIgaGVpZ2h0PSIxNy4wNjciLz4KCTxyZWN0IHg9IjI4NS44NzkiIHk9IjMxNS43MzMiIHN0eWxlPSJmaWxsOiNCM0IzQjM7IiB3aWR0aD0iMTAyLjQiIGhlaWdodD0iMTcuMDY3Ii8+Cgk8cmVjdCB4PSIyODUuODc5IiB5PSIzNDkuODY3IiBzdHlsZT0iZmlsbDojQjNCM0IzOyIgd2lkdGg9IjEwMi40IiBoZWlnaHQ9IjE3LjA2NyIvPgoJPHJlY3QgeD0iMjg1Ljg3OSIgeT0iMzg0IiBzdHlsZT0iZmlsbDojQjNCM0IzOyIgd2lkdGg9IjY4LjI2NyIgaGVpZ2h0PSIxNy4wNjciLz4KCTxyZWN0IHg9IjMyOC41NDYiIHk9IjQ5NC45MzMiIHN0eWxlPSJmaWxsOiNCM0IzQjM7IiB3aWR0aD0iMTI4IiBoZWlnaHQ9IjE3LjA2NyIvPgoJPHJlY3QgeD0iNDczLjYwNCIgeT0iNDk0LjkzMyIgc3R5bGU9ImZpbGw6I0IzQjNCMzsiIHdpZHRoPSIxNy4wNjciIGhlaWdodD0iMTcuMDY3Ii8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==";

export default APP_LOGO_BASE64;
