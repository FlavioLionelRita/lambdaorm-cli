/* eslint-disable no-mixed-spaces-and-tabs */
import { CommandModule, Argv, Arguments } from 'yargs'
import { Orm } from 'lambdaorm'
import path from 'path'
import dotenv from 'dotenv'

export class SyncCommand implements CommandModule {
	command = 'sync';
	describe = 'Syncronize database.';

	builder (args: Argv) {
		return args
			.option('w', {
				alias: 'workspace',
				describe: 'project path.'
			})
			.option('s', {
				alias: 'stage',
				describe: 'Name of stage'
			})
			.option('e', {
				alias: 'envfile',
				describe: 'Read in a file of environment variables'
			})
			.option('o', {
				alias: 'output',
				describe: 'Generates the queries but does not apply'
			})
	}

	async handler (args: Arguments) {
		const workspace = path.resolve(process.cwd(), args.workspace as string || '.')
		const stageName = args.stage as string
		const output = args.output as string
		const envfile = args.envfile as string

		if (envfile) {
			const fullpath = path.resolve(process.cwd(), envfile)
			dotenv.config({ path: fullpath, override: true })
		}
		const orm = new Orm(workspace)
		try {
			const schema = await orm.schema.get(workspace)
			await orm.init(schema)
			const stage = orm.schema.stage.get(stageName)

			if (output) {
				const sentence = await orm.stage.sync(stage.name).sentence()
				console.log(sentence)
			} else {
				await orm.stage.sync(stage.name).execute()
			}
		} catch (error) {
			console.error(`error: ${error}`)
		} finally {
			orm.end()
		}
	}
}
