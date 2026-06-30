import argparse

import uvicorn


def main() -> None:
    parser = argparse.ArgumentParser(description='Run the AnyStore Google ADK backend service.')
    parser.add_argument('--host', default='0.0.0.0')
    parser.add_argument('--port', type=int, default=8080)
    parser.add_argument('--no-reload', action='store_true', help='Disable uvicorn auto-reload.')
    args = parser.parse_args()

    uvicorn.run(
        'anystore_agent.app:app',
        host=args.host,
        port=args.port,
        reload=not args.no_reload,
    )


if __name__ == '__main__':
    main()
