/**
 * @see https://stackoverflow.com/a/65152534
 * @description jaydenseric/useIsMounted.mjs
 * @see https://gist.github.com/jaydenseric/a67cfb1b809b1b789daa17dfe6f83daa
 */
import React from 'react'

export const useIsMounted = () => {
	const ref = React.useRef(false)
	const [, setIsMounted] = React.useState(false)
	React.useEffect(() => {
		ref.current = true
		setIsMounted(true)
		return () => (ref.current = false)
	}, [])
	return () => ref.current
}
