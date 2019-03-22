const SVG_EDIT_BASE64 = "data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA1MDQuNDggNTA0LjQ4IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MDQuNDggNTA0LjQ4OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjUxMnB4IiBoZWlnaHQ9IjUxMnB4Ij4KPHBhdGggc3R5bGU9ImZpbGw6IzIzOTRCQzsiIGQ9Ik00OTIuNTM0LDE0NS43NzJMMTcyLjMzNyw0NjEuNjM2YzAsMC0xNjMuODQsNDguODM3LTE3MS4zMjMsNDEuMzU0czM3LjQxNS0xNzUuMjYxLDM3LjQxNS0xNzUuMjYxICBMMzU4LjYyNiwxMS44NjRjMTUuMzYtMTUuNzU0LDQwLjE3Mi0xNS43NTQsNTUuNTMyLDBsNzguMzc1LDc4Ljc2OUM1MDcuODk0LDEwNS41OTksNTA3Ljg5NCwxMzAuNDEyLDQ5Mi41MzQsMTQ1Ljc3MnoiLz4KPHBhdGggc3R5bGU9ImZpbGw6IzQ0QTRDNjsiIGQ9Ik02Ni4zOTIsMzY3LjExM0w0MTguMDk3LDE1LjQwOWwtMy45MzgtMy45MzhjLTE1LjM2LTE1LjM2LTQwLjE3Mi0xNS4zNi01NS41MzIsMC4zOTRMMzguODIzLDMyOC4xMjMgIGMwLDAtMC43ODgsMy4xNTEtMi4zNjMsOC42NjVMNjYuMzkyLDM2Ny4xMTNMNjYuMzkyLDM2Ny4xMTN6Ii8+CjxwYXRoIHN0eWxlPSJmaWxsOiMxRjg1QTk7IiBkPSJNNTAxLjU5MiwxMzIuNzc1YzUuNTE0LTE0LjE3OCwyLjc1Ny0zMS4xMTQtOC42NjUtNDIuNTM1bC03Ljg3Ny03Ljg3N0wxMzMuMzQ2LDQzNC4wNjdsMzAuNzIsMzAuMzI2ICBjNC4zMzItMS4xODIsNy4wODktMS45NjksOC4yNzEtMi4zNjNDMTcyLjMzNyw0NjIuMDMsNTAxLjU5MiwxMzIuNzc1LDUwMS41OTIsMTMyLjc3NXoiLz4KPHBhdGggc3R5bGU9ImZpbGw6I0ZGQ0FCQTsiIGQ9Ik0wLjYyLDUwMS44MDlsMi4zNjMsMi4zNjNjMTguNTExLDIuNzU3LDE2MC42ODktMzkuMzg1LDE2OS4zNTQtNDIuMTQybDAuMzk0LTAuMzk0ICBjMCwwLTkuMDU4LTQyLjUzNS0xNi45MzUtNTAuMDE4Yy03Ljg3Ny03Ljg3Ny00Mi4xNDItOS4wNTgtNTAuMDE4LTE2LjU0MmMtNy44NzctNy44NzctOC42NjUtNDIuMTQyLTE2LjkzNS01MC4wMTggIGMtNy44NzctNy44NzctNDguMDQ5LTE2LjE0OC01MC4wMTgtMTYuNTQyQzM4LjgyMywzMjguMTIzLTIuNTMxLDQ4Mi4xMTYsMC42Miw1MDEuODA5TDAuNjIsNTAxLjgwOXoiLz4KPHBhdGggc3R5bGU9ImZpbGw6I0ZGRENEMjsiIGQ9Ik0wLjIyNiw0OTkuODM5YzIuNzU3LTQuNzI2LDE2LjU0Mi0yOS4xNDUsODguMjIyLTE1NC43ODFjLTcuODc3LTcuODc3LTQ4LjA0OS0xNi4xNDgtNTAuMDE4LTE2LjU0MiAgQzM4LjgyMywzMjguMTIzLTAuMTY4LDQ3My44NDYsMC4yMjYsNDk5LjgzOXoiLz4KPHBhdGggc3R5bGU9ImZpbGw6I0U1QjVBNzsiIGQ9Ik0wLjIyNiw1MDAuMjMzdjEuMTgybDIuMzYzLDIuMzYzYzE4LjUxMSwyLjc1NywxNjAuNjg5LTM5LjM4NSwxNjkuMzU0LTQyLjE0MmwwLjM5NC0wLjM5NCAgYzAsMC04LjY2NS00Mi4xNDItMTYuNTQyLTUwLjAxOEMyNS40MzIsNDg2LjA1NSwzLjc3MSw0OTguMjY0LDAuMjI2LDUwMC4yMzN6Ii8+CjxwYXRoIHN0eWxlPSJmaWxsOiMyMzk0QkM7IiBkPSJNMjcuNDAyLDQ3My4wNThjLTUuMTItNS4xMi0xMy4zOTEtOS4wNTgtMjEuNjYyLTkuODQ2Yy00LjMzMiwyMi4wNTUtNy4wODksMzguMjAzLTQuNzI2LDQwLjU2NiAgYzEuOTY5LDEuOTY5LDE2LjkzNS0wLjM5NCwzNi42MjgtNC43MjZDMzcuNjQyLDQ4OS4yMDYsMzMuMzA5LDQ3OC45NjYsMjcuNDAyLDQ3My4wNTh6Ii8+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=";

export default SVG_EDIT_BASE64;