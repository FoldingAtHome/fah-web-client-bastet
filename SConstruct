import os
import json
env = Environment(ENV = os.environ)
try:
  paths = [os.environ.get('CBANG_HOME'), os.environ.get('CBANG_CONFIG_HOME')]
  env.Tool('config', toolpath = paths)
except Exception as e:
  raise Exception('CBANG_HOME not set?\n' + str(e))

env.CBLoadTools('dist packager')
conf = env.CBConfigure()

with open('package.json', 'r') as f: package_info = json.load(f)

env.Replace(PACKAGE_VERSION = package_info['version'])
env.Replace(dist_build = '')
conf.Finish()

if 'dist' in COMMAND_LINE_TARGETS:
  if not env.GetOption('clean'):
    env.RunCommandOrRaise(['npm', 'install'])
    env.RunCommandOrRaise(['npm', 'run', 'build'])

  distfiles = ['dist', 'LICENSE']
  tar = env.ZipDist(package_info['name'], distfiles)
  AlwaysBuild(tar)
  Alias('dist', tar)
  Clean(tar, ['dist', 'dist.txt'])

if 'distclean' in COMMAND_LINE_TARGETS:
  Clean('distclean', ['.sconsign.dblite', '.sconf_temp', 'config.log',
    'node_modules', 'package-lock.json',
    Glob('*.tar.bz2'), Glob('*.zip'),'dist', 'dist.txt'])
