/**
 * install pkgs
 */
import { resolve } from 'path'
import { install, InstallOptions } from 'esinstall'

/**
 * get root path of an external package
 */
export const getPkgRoot = (pkgEntry: string): string => {
  const arr = pkgEntry.split('/node_modules/')
  const pkgName = arr[1].split('/')[0]
  return resolve(arr[0], 'node_modules', pkgName)
}

export const installPackages = async (
  installTargets: string[],
  installOptions: InstallOptions
) => {
  const finalRes = await install(installTargets, {
    ...installOptions,
    stats: false
  })

  return {
    importMap: finalRes.importMap
  }
}
